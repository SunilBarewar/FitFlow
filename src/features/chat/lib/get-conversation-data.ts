import "server-only";
import { Types } from "mongoose";
import type { ChatBlock, Plan } from "@/features/chat/types";
import { ensureSession } from "@/features/workout/lib/session-store";
import type { WorkoutSession } from "@/features/workout/types";
import { connectDB } from "@/lib/db";
import { ConversationModel } from "@/models/conversation";
import { MessageModel } from "@/models/message";

const HISTORY_LIMIT = 50;

export type StoredMessage = {
  id: string;
  role: "user" | "assistant";
  text?: string;
  block?: ChatBlock;
};

export type ConversationData = {
  hasPlan: boolean;
  activePlan: Plan | null;
  /** Today's workout session — the same one /home edits, and what the Today
   * tab renders. The panel's DayLog is derived from it on the client. */
  todaySession: WorkoutSession | null;
  messages: StoredMessage[];
};

export async function getConversationData(
  userId: string,
  date: string,
  dayLabel: string,
): Promise<ConversationData> {
  await connectDB();

  const userObjId = new Types.ObjectId(userId);
  // Plain objects only — hydrated subdocuments break RSC prop serialization.
  const conversation = await ConversationModel.findOneAndUpdate(
    { userId: userObjId },
    { $setOnInsert: { userId: userObjId } },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true },
  ).lean();
  if (!conversation) {
    throw new Error("Failed to load conversation");
  }

  const rawMessages = await MessageModel.find({
    conversationId: conversation._id,
  })
    .sort({ createdAt: 1 })
    .limit(HISTORY_LIMIT)
    .lean();

  // Materializes today's session from the active plan on first open; null
  // when there is no plan yet, which is also when the chat panel is hidden.
  const session = await ensureSession(userId, date, dayLabel);

  return {
    hasPlan: Boolean(conversation.hasPlan && conversation.activePlan),
    activePlan: (conversation.activePlan as Plan) ?? null,
    todaySession: session,
    messages: rawMessages.map((m) => ({
      id: m._id.toString(),
      role: m.role as "user" | "assistant",
      text: m.text ?? undefined,
      block: m.block ?? undefined,
    })),
  };
}
