import { isUsableDate, requireUser } from "@/features/workout/lib/guards";
import { applySessionAdjustment } from "@/features/workout/lib/session-store";
import type { SessionAdjustmentPatch } from "@/features/workout/types";
import { apiError } from "@/lib/utils/http";

// ---------------------------------------------------------------------------
// PATCH /api/workout/today/adjust
// Day-scoped edits only — shorter session, dropped movement, stand-in, extra.
// The weekly plan is never written here.
// ---------------------------------------------------------------------------

type Body = { date: string } & SessionAdjustmentPatch;

export async function PATCH(request: Request) {
  const userId = await requireUser();
  if (!userId) return apiError("You're not signed in.", 401, "UNAUTHORIZED");

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return apiError("Invalid JSON body.", 400, "INVALID_JSON");
  }

  if (!isUsableDate(body?.date) || !body.reason?.trim()) {
    return apiError(
      "An adjustment needs a date and a reason.",
      400,
      "VALIDATION_ERROR",
    );
  }

  if (
    body.targetMinutes !== undefined &&
    (!Number.isFinite(body.targetMinutes) ||
      body.targetMinutes < 5 ||
      body.targetMinutes > 180)
  ) {
    return apiError(
      "Session length must be between 5 and 180 minutes.",
      400,
      "VALIDATION_ERROR",
    );
  }

  const session = await applySessionAdjustment(userId, body.date, {
    reason: body.reason.trim(),
    source: "user",
    targetMinutes: body.targetMinutes,
    remove: body.remove,
    add: body.add,
    replace: body.replace,
  });
  if (!session) return apiError("No session for that date.", 404, "NOT_FOUND");

  return Response.json({ session });
}
