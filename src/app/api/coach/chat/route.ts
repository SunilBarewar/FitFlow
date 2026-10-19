import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { Types } from "mongoose";
import type { ChatBlock } from "@/features/chat/types";
import { coachAgent } from "@/features/coach/agent/coach-agent";
import { createCoachProgressWriter } from "@/features/coach/agent/coach-progress-stream";
import { coachStepLabelForTool } from "@/features/coach/agent/coach-step-labels";
import {
  buildPlan,
  toChatWidgetFromInput,
} from "@/features/coach/agent/to-chat-widget";
import {
  applySessionAdjustment,
  ensureSession,
  resetSessionToPlan,
} from "@/features/workout/lib/session-store";
import { getSessionFromCookies } from "@/lib/auth/session";
import {
  getTodayRef,
  isDateKey,
  isWithinServerDayWindow,
} from "@/lib/date/today";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/utils/http";
import { ConversationModel } from "@/models/conversation";
import { MessageModel } from "@/models/message";

type IncomingBody = {
  messages?: unknown;
  /** The client's notion of today, so day-scoped edits land on the right date
   * rather than on the server's timezone. Validated before use. */
  todayDate?: unknown;
  todayDayLabel?: unknown;
};

/** The client owns "today"; the server still refuses an implausible date. */
function resolveDayRef(body: IncomingBody): { date: string; dayLabel: string } {
  const fallback = getTodayRef();
  if (
    isDateKey(body.todayDate) &&
    isWithinServerDayWindow(body.todayDate) &&
    typeof body.todayDayLabel === "string" &&
    body.todayDayLabel
  ) {
    return { date: body.todayDate, dayLabel: body.todayDayLabel };
  }
  return fallback;
}

/** Extract plain text from the AI SDK message parts array. */
function textFromMessage(message: UIMessage | undefined): string {
  if (!message) return "";
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function hasRespondableContent(messages: UIMessage[]): boolean {
  return messages.some(
    (message) => message.role === "user" && textFromMessage(message).trim(),
  );
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return apiError("You're not signed in.", 401, "UNAUTHORIZED");
  }

  let body: IncomingBody;
  try {
    body = (await request.json()) as IncomingBody;
  } catch {
    return apiError("Invalid JSON body.", 400, "INVALID_JSON");
  }

  if (!Array.isArray(body.messages)) {
    return apiError("Expected a messages array.", 400, "VALIDATION_ERROR");
  }

  const uiMessages = body.messages as UIMessage[];
  if (!hasRespondableContent(uiMessages)) {
    return apiError(
      "No message content to respond to.",
      400,
      "VALIDATION_ERROR",
    );
  }

  const lastMessage = uiMessages[uiMessages.length - 1];
  const newUserText =
    lastMessage?.role === "user" ? textFromMessage(lastMessage) : undefined;

  await connectDB();

  const userId = new Types.ObjectId(session.sub);

  let conversation = await ConversationModel.findOne({ userId });
  if (!conversation) {
    conversation = await ConversationModel.create({ userId });
  }
  const conversationId = conversation._id;

  if (newUserText) {
    await MessageModel.create({
      conversationId,
      role: "user",
      text: newUserText,
    });
  }

  let modelMessages: Awaited<ReturnType<typeof convertToModelMessages>>;
  try {
    modelMessages = await convertToModelMessages(uiMessages, {
      tools: coachAgent.tools,
      convertDataPart: (part) => {
        const data = part.data as { type?: string } | null;
        return {
          type: "text" as const,
          text: `[Widget shown: ${data?.type ?? "block"}]`,
        };
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid message history.";
    return apiError(message, 400, "VALIDATION_ERROR");
  }

  // Per-request context (today's day + active plan + today's actual session)
  // via instructions — not system messages in `messages`.
  const dayRef = resolveDayRef(body);
  const contextLines: string[] = [`Today is ${dayRef.dayLabel}.`];
  if (conversation.activePlan) {
    const plan = conversation.activePlan as {
      name?: string;
      daysPerWeek?: number;
      minutesPerSession?: number;
      days?: Array<{
        label?: string;
        focus?: string;
        exercises?: Array<{
          id?: string;
          name?: string;
          sets?: number;
          reps?: string;
          equipment?: string;
        }>;
      }>;
    };
    const dayLines = (plan.days ?? [])
      .map((day) => {
        const exLines = (day.exercises ?? [])
          .map(
            (ex) =>
              `  - ${ex.name} (id: ${ex.id}) · ${ex.sets} × ${ex.reps} · ${ex.equipment}`,
          )
          .join("\n");
        return `${day.label} – ${day.focus}:\n${exLines || "  (rest)"}`;
      })
      .join("\n\n");
    contextLines.push(
      `Active plan: "${plan.name}" (${plan.daysPerWeek} days/week, ${plan.minutesPerSession} min/session)\n\n${dayLines}`,
    );
  } else {
    contextLines.push("The user has no active plan yet.");
  }

  // Today's session as it actually stands — what was logged, what was dropped,
  // what was swapped. Without this the coach guesses at progress, or re-offers
  // an adjustment it already made.
  const todaySession = await ensureSession(
    session.sub,
    dayRef.date,
    dayRef.dayLabel,
  );
  if (todaySession) {
    if (todaySession.exercises.length === 0) {
      contextLines.push(
        `Today's session (${dayRef.date}): rest day — nothing planned.`,
      );
    } else {
      const lines = todaySession.exercises
        .map((exercise) => {
          const marks: string[] = [exercise.status];
          if (exercise.origin !== "plan") marks.push(exercise.origin);
          if (exercise.note) marks.push(`note: "${exercise.note}"`);
          return `  - ${exercise.name} (id: ${exercise.id}) · ${exercise.sets} × ${exercise.reps} · ${marks.join(" · ")}`;
        })
        .join("\n");
      const adjusted = todaySession.adjustment
        ? `\nAlready adjusted today: ${todaySession.adjustment.reason}. Don't offer the same change twice.`
        : "";
      contextLines.push(
        `Today's session (${dayRef.date}) — status: ${todaySession.status}, ${todaySession.targetMinutes ?? "?"} min:\n${lines}${adjusted}`,
      );
    }
  }

  let streamResult: Awaited<ReturnType<typeof coachAgent.stream>>;
  try {
    streamResult = await coachAgent.stream({
      messages: modelMessages,
      options: { sessionContext: contextLines.join("\n\n") },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The coach couldn't respond.";
    return apiError(message, 502, "AGENT_FAILED");
  }

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      let accText = "";
      let accBlock: ChatBlock | null = null;
      const coachProgress = createCoachProgressWriter(writer);
      coachProgress.start("Reading your message");

      for await (const part of streamResult.fullStream) {
        if (part.type === "start-step") {
          coachProgress.advance("Thinking...");
          continue;
        }

        if (part.type === "text-start") {
          coachProgress.completeAll();
          writer.write({ type: "text-start", id: part.id });
          continue;
        }

        if (part.type === "text-delta") {
          accText += part.text;
          writer.write({
            type: "text-delta",
            id: part.id,
            delta: part.text,
          });
          continue;
        }

        if (part.type === "text-end") {
          writer.write({ type: "text-end", id: part.id });
          continue;
        }

        if (part.type === "tool-call") {
          coachProgress.advance(
            coachStepLabelForTool(part.toolName, part.input),
          );
        }

        if (part.type === "tool-call" && part.toolName === "update_plan") {
          const input = part.input as {
            name: string;
            daysPerWeek: number;
            minutesPerSession: number;
            days: Array<{
              label: string;
              focus: string;
              exercises: Array<{
                exerciseId: string;
                name: string;
                sets: number;
                reps: string;
                equipment: string;
              }>;
            }>;
          };
          const plan = buildPlan(
            input.name,
            input.daysPerWeek,
            input.minutesPerSession,
            input.days,
          );
          await ConversationModel.findByIdAndUpdate(conversationId, {
            hasPlan: true,
            activePlan: plan,
          });
          // Emit plan_updated to sync the client panel in real-time (not persisted as message block)
          writer.write({
            type: "data-widget",
            id: part.toolCallId,
            data: { type: "plan_updated", id: part.toolCallId, plan },
          });
        }

        if (
          part.type === "tool-call" &&
          part.toolName === "adjust_today_session"
        ) {
          const input = part.input as {
            reason: string;
            targetMinutes: number | null;
            remove: string[] | null;
            add: { exerciseId: string; sets: number; reps: string }[] | null;
            replace:
              | {
                  exerciseId: string;
                  withExerciseId: string;
                  sets: number;
                  reps: string;
                }[]
              | null;
            restore: boolean | null;
          };

          // The session has to exist before it can be edited — the user may
          // never have opened the home page today.
          await ensureSession(session.sub, dayRef.date, dayRef.dayLabel);

          const adjusted = input.restore
            ? await resetSessionToPlan(
                session.sub,
                dayRef.date,
                dayRef.dayLabel,
              )
            : await applySessionAdjustment(session.sub, dayRef.date, {
                reason: input.reason,
                source: "coach",
                targetMinutes: input.targetMinutes ?? undefined,
                remove: input.remove ?? undefined,
                add: input.add ?? undefined,
                replace: input.replace ?? undefined,
              });

          // Sync the live panel in real time. Transient, like plan_updated —
          // never persisted as a message block.
          if (adjusted) {
            writer.write({
              type: "data-widget",
              id: part.toolCallId,
              data: {
                type: "session_adjusted",
                id: part.toolCallId,
                session: adjusted,
              },
            });
          }
        }

        if (part.type === "tool-call" && part.toolName === "show_widget") {
          const widget = toChatWidgetFromInput(part.input);
          if (widget) {
            accBlock = widget;
            writer.write({
              type: "data-widget",
              id: part.toolCallId,
              data: widget,
            });

            if (widget.type === "plan_created") {
              await ConversationModel.findByIdAndUpdate(conversationId, {
                hasPlan: true,
                activePlan: widget.plan,
              });
            }
          }
        }
      }

      if (accText || accBlock) {
        await MessageModel.create({
          conversationId,
          role: "assistant",
          text: accText || undefined,
          block: accBlock ?? undefined,
        });
      }
    },
    onError: (error) =>
      error instanceof Error ? error.message : "The coach couldn't respond.",
  });

  return createUIMessageStreamResponse({ stream });
}
