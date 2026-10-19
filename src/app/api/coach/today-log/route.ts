import type { ExerciseLogStatus } from "@/features/chat/types";
import { sessionToDayLog } from "@/features/workout/lib/adapters";
import { sessionStoreApiError } from "@/features/workout/lib/handle-session-error";
import {
  ensureSession,
  setExerciseStatus,
} from "@/features/workout/lib/session-store";
import { getSessionFromCookies } from "@/lib/auth/session";
import { isDateKey, isWithinServerDayWindow } from "@/lib/date/today";
import { apiError } from "@/lib/utils/http";

// ---------------------------------------------------------------------------
// PATCH /api/coach/today-log
// Marks one exercise done/skipped/pending for a given date, with an optional
// note. Request and response shapes are unchanged — the state now lives in
// workout_sessions (see docs/workout-home-page.md).
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
    !isDateKey(body?.date) ||
    !body.dayLabel ||
    !body.exerciseId ||
    !VALID_STATUSES.includes(body.status)
  ) {
    return apiError("Invalid today-log update.", 400, "VALIDATION_ERROR");
  }

  if (!isWithinServerDayWindow(body.date)) {
    return apiError("That date is out of range.", 400, "VALIDATION_ERROR");
  }

  const ensured = await ensureSession(session.sub, body.date, body.dayLabel);
  if (!ensured) {
    return apiError("No active plan yet.", 404, "NOT_FOUND");
  }

  let updated;
  try {
    updated = await setExerciseStatus(
      session.sub,
      body.date,
      body.exerciseId,
      body.status,
      body.note,
    );
  } catch (error) {
    return sessionStoreApiError(error);
  }
  if (!updated) {
    return apiError("No session for that date.", 404, "NOT_FOUND");
  }

  // The session goes back too: the chat panel renders today straight from it,
  // and publishes it to whatever else is watching today's session.
  return Response.json({
    todayLog: sessionToDayLog(updated),
    session: updated,
  });
}
