import { Types } from "mongoose";
import type {
  DayLog,
  ExerciseLogEntry,
  ExerciseLogStatus,
} from "@/features/chat/types";
import { getSessionFromCookies } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/utils/http";
import { ConversationModel } from "@/models/conversation";

// ---------------------------------------------------------------------------
// PATCH /api/coach/today-log
// Marks one exercise done/skipped/pending for a given date, with an optional
// note. Logs are kept per-date so the Today tab's state survives a reload.
// ---------------------------------------------------------------------------

type PatchBody = {
  date: string;
  dayLabel: string;
  exerciseId: string;
  status: ExerciseLogStatus;
  note?: string;
};

const VALID_STATUSES: ExerciseLogStatus[] = ["pending", "done", "skipped"];

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

  if (
    !body?.date ||
    !body.dayLabel ||
    !body.exerciseId ||
    !VALID_STATUSES.includes(body.status)
  ) {
    return apiError("Invalid today-log update.", 400, "VALIDATION_ERROR");
  }

  await connectDB();

  const userId = new Types.ObjectId(session.sub);
  const existing = await ConversationModel.findOne({ userId }).lean();
  if (!existing) {
    return apiError("No conversation yet.", 404, "NOT_FOUND");
  }

  const dailyLogs: DayLog[] = (existing.dailyLogs ?? []).map((log) => ({
    date: log.date,
    dayLabel: log.dayLabel,
    entries: log.entries.map((entry) => ({
      exerciseId: entry.exerciseId,
      status: entry.status as ExerciseLogStatus,
      note: entry.note ?? undefined,
    })),
  }));

  let dayLog = dailyLogs.find((log) => log.date === body.date);
  if (!dayLog) {
    dayLog = { date: body.date, dayLabel: body.dayLabel, entries: [] };
    dailyLogs.push(dayLog);
  } else {
    dayLog.dayLabel = body.dayLabel;
  }

  const entryIndex = dayLog.entries.findIndex(
    (entry) => entry.exerciseId === body.exerciseId,
  );
  const nextEntry: ExerciseLogEntry = {
    exerciseId: body.exerciseId,
    status: body.status,
    note: body.note || undefined,
  };
  if (entryIndex >= 0) {
    dayLog.entries[entryIndex] = nextEntry;
  } else {
    dayLog.entries.push(nextEntry);
  }

  await ConversationModel.findOneAndUpdate(
    { userId },
    { dailyLogs },
    { new: true },
  );

  return Response.json({ todayLog: dayLog });
}
