import { Types } from "mongoose";
import type { DayLog, Plan } from "@/features/chat/types";
import { getSessionFromCookies } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/utils/http";
import { ConversationModel } from "@/models/conversation";
import { MessageModel } from "@/models/message";

/** Number of messages we load into the chat context on page open. */
const HISTORY_LIMIT = 50;

// ---------------------------------------------------------------------------
// GET /api/coach/conversation?date=YYYY-MM-DD&dayLabel=Monday
// Find-or-create the user's single conversation and return the last 50
// messages. `date`/`dayLabel` (the client's notion of "today", matching what
// it also sends to /api/coach/today-log) are used to find today's log entry.
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return apiError("You're not signed in.", 401, "UNAUTHORIZED");
  }

  const url = new URL(request.url);
  const todayDate = url.searchParams.get("date");
  const todayDayLabel = url.searchParams.get("dayLabel");

  await connectDB();

  const userId = new Types.ObjectId(session.sub);

  // Atomically find or create the conversation (upsert on unique userId index)
  let conversation = await ConversationModel.findOne({ userId });
  if (!conversation) {
    conversation = await ConversationModel.create({ userId });
  }

  const messages = await MessageModel.find({ conversationId: conversation._id })
    .sort({ createdAt: 1 })
    .limit(HISTORY_LIMIT)
    .lean();

  const dailyLogs = (conversation.dailyLogs ?? []) as DayLog[];
  const todayLog =
    todayDate && todayDayLabel
      ? (dailyLogs.find(
          (log) => log.date === todayDate && log.dayLabel === todayDayLabel,
        ) ?? null)
      : null;

  return Response.json({
    conversationId: conversation._id.toString(),
    hasPlan: conversation.hasPlan,
    activePlan: conversation.activePlan ?? null,
    todayLog,
    messages: messages.map((m) => ({
      id: m._id.toString(),
      role: m.role,
      text: m.text ?? undefined,
      block: m.block ?? undefined,
      createdAt: (m.createdAt as Date).toISOString(),
    })),
  });
}

// ---------------------------------------------------------------------------
// PATCH /api/coach/conversation
// Called when the user accepts a weekly plan. Sets hasPlan: true and stores
// the plan, overwriting any previous one.
// ---------------------------------------------------------------------------

type PatchBody = {
  activePlan: Plan;
};

// ---------------------------------------------------------------------------
// DELETE /api/coach/conversation
// Clears chat history for a fresh thread. Keeps the active plan intact.
// ---------------------------------------------------------------------------

export async function DELETE() {
  const session = await getSessionFromCookies();
  if (!session) {
    return apiError("You're not signed in.", 401, "UNAUTHORIZED");
  }

  await connectDB();

  const userId = new Types.ObjectId(session.sub);
  const conversation = await ConversationModel.findOne({ userId });
  if (!conversation) {
    return Response.json({ cleared: true });
  }

  await MessageModel.deleteMany({ conversationId: conversation._id });

  return Response.json({ cleared: true });
}

export async function PATCH(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return apiError("You're not signed in.", 401, "UNAUTHORIZED");
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return apiError("Invalid JSON body.", 400, "INVALID_JSON");
  }

  if (!body?.activePlan || typeof body.activePlan !== "object") {
    return apiError("Expected activePlan in body.", 400, "VALIDATION_ERROR");
  }

  await connectDB();

  const userId = new Types.ObjectId(session.sub);

  const conversation = await ConversationModel.findOneAndUpdate(
    { userId },
    { hasPlan: true, activePlan: body.activePlan },
    { new: true, upsert: true },
  );

  return Response.json({
    conversationId: conversation._id.toString(),
    hasPlan: conversation.hasPlan,
    activePlan: conversation.activePlan ?? null,
  });
}
