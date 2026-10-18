import { Types } from "mongoose";
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { coachAgent } from "@/features/coach/agent/coach-agent";
import { toChatWidgetFromInput } from "@/features/coach/agent/to-chat-widget";
import { getSessionFromCookies } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/utils/http";
import { ConversationModel } from "@/models/conversation";
import { MessageModel } from "@/models/message";
import type { ChatBlock } from "@/features/chat/types";

type IncomingBody = {
  messages?: unknown;
};

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
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Invalid message history.";
    return apiError(message, 400, "VALIDATION_ERROR");
  }

  let streamResult: Awaited<ReturnType<typeof coachAgent.stream>>;
  try {
    streamResult = await coachAgent.stream({ messages: modelMessages });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The coach couldn't respond.";
    return apiError(message, 502, "AGENT_FAILED");
  }

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      let accText = "";
      let accBlock: ChatBlock | null = null;

      for await (const part of streamResult.fullStream) {
        if (part.type === "text-start") {
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
