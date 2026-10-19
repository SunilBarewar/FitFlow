import { isUsableDate, requireUser } from "@/features/workout/lib/guards";
import {
  ensureSession,
  getWeekSummary,
} from "@/features/workout/lib/session-store";
import { apiError } from "@/lib/utils/http";

// ---------------------------------------------------------------------------
// GET /api/workout/today?date=YYYY-MM-DD&dayLabel=Monday
// Today's session (materialized from the plan on first open) plus the week
// strip around it. 404 NO_ACTIVE_PLAN is the signal to send the user to /chat.
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const userId = await requireUser();
  if (!userId) return apiError("You're not signed in.", 401, "UNAUTHORIZED");

  const url = new URL(request.url);
  const date = url.searchParams.get("date");
  const dayLabel = url.searchParams.get("dayLabel");

  if (!isUsableDate(date) || !dayLabel) {
    return apiError("Missing or invalid date.", 400, "VALIDATION_ERROR");
  }

  const session = await ensureSession(userId, date, dayLabel);
  if (!session) {
    return apiError("No active plan yet.", 404, "NO_ACTIVE_PLAN");
  }

  const week = await getWeekSummary(userId, date);
  return Response.json({ session, week });
}
