import "server-only";
import { Types } from "mongoose";
import type { ChatBlock, DayLog, Plan } from "@/features/chat/types";
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
  todayLog: DayLog | null;
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

  const dailyLogs = (conversation.dailyLogs ?? []) as DayLog[];
  const todayLog =
    dailyLogs.find((log) => log.date === date && log.dayLabel === dayLabel) ??
    null;

  return {
    hasPlan: Boolean(conversation.hasPlan && conversation.activePlan),
    activePlan: (conversation.activePlan as Plan) ?? null,
    todayLog,
    messages: rawMessages.map((m) => ({
      id: m._id.toString(),
      role: m.role as "user" | "assistant",
      text: m.text ?? undefined,
      block: m.block ?? undefined,
    })),
  };
}
