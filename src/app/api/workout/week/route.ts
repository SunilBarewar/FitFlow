import { isUsableDate, requireUser } from "@/features/workout/lib/guards";
import { getWeekSummary } from "@/features/workout/lib/session-store";
import { apiError } from "@/lib/utils/http";

// ---------------------------------------------------------------------------
// GET /api/workout/week?date=YYYY-MM-DD — the Monday-first week around a date.
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const userId = await requireUser();
  if (!userId) return apiError("You're not signed in.", 401, "UNAUTHORIZED");

  const date = new URL(request.url).searchParams.get("date");
  if (!isUsableDate(date)) {
    return apiError("Missing or invalid date.", 400, "VALIDATION_ERROR");
  }

  return Response.json({ week: await getWeekSummary(userId, date) });
}
