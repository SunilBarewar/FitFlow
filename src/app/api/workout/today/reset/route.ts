import { isUsableDate, requireUser } from "@/features/workout/lib/guards";
import { sessionStoreApiError } from "@/features/workout/lib/handle-session-error";
import { resetSessionToPlan } from "@/features/workout/lib/session-store";
import { apiError } from "@/lib/utils/http";

// ---------------------------------------------------------------------------
// POST /api/workout/today/reset — drop today's divergence, rebuild from plan.
// ---------------------------------------------------------------------------

type Body = { date: string; dayLabel: string };

export async function POST(request: Request) {
  const userId = await requireUser();
  if (!userId) return apiError("You're not signed in.", 401, "UNAUTHORIZED");

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return apiError("Invalid JSON body.", 400, "INVALID_JSON");
  }

  if (!isUsableDate(body?.date) || !body.dayLabel) {
    return apiError("Missing or invalid date.", 400, "VALIDATION_ERROR");
  }

  let session;
  try {
    session = await resetSessionToPlan(userId, body.date, body.dayLabel);
  } catch (error) {
    return sessionStoreApiError(error);
  }
  if (!session) return apiError("No active plan yet.", 404, "NO_ACTIVE_PLAN");

  return Response.json({ session });
}
