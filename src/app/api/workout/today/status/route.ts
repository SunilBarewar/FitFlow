import { isUsableDate, requireUser } from "@/features/workout/lib/guards";
import { sessionStoreApiError } from "@/features/workout/lib/handle-session-error";
import { setSessionStatus } from "@/features/workout/lib/session-store";
import type { SessionStatus } from "@/features/workout/types";
import { apiError } from "@/lib/utils/http";

// ---------------------------------------------------------------------------
// PATCH /api/workout/today/status — skip the day, reset, or legacy finish.
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

  let session;
  try {
    session = await setSessionStatus(userId, body.date, body.status);
  } catch (error) {
    return sessionStoreApiError(error);
  }
  if (!session) return apiError("No session for that date.", 404, "NOT_FOUND");

  return Response.json({ session });
}
