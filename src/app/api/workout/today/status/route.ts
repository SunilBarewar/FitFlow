import { isUsableDate, requireUser } from "@/features/workout/lib/guards";
import { setSessionStatus } from "@/features/workout/lib/session-store";
import type { SessionStatus } from "@/features/workout/types";
import { apiError } from "@/lib/utils/http";

// ---------------------------------------------------------------------------
// PATCH /api/workout/today/status — start, finish, skip the day, or clear it.
// ---------------------------------------------------------------------------

type Body = { date: string; status: SessionStatus };

/** "rest" is derived from an empty plan day, never set by hand. */
const SETTABLE: SessionStatus[] = [
  "not_started",
  "in_progress",
  "completed",
  "skipped",
];

export async function PATCH(request: Request) {
  const userId = await requireUser();
  if (!userId) return apiError("You're not signed in.", 401, "UNAUTHORIZED");

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return apiError("Invalid JSON body.", 400, "INVALID_JSON");
  }

  if (!isUsableDate(body?.date) || !SETTABLE.includes(body.status)) {
    return apiError("Invalid session status.", 400, "VALIDATION_ERROR");
  }

  const session = await setSessionStatus(userId, body.date, body.status);
  if (!session) return apiError("No session for that date.", 404, "NOT_FOUND");

  return Response.json({ session });
}
