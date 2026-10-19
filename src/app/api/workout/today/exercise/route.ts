import type { ExerciseLogStatus } from "@/features/chat/types";
import { isUsableDate, requireUser } from "@/features/workout/lib/guards";
import { sessionStoreApiError } from "@/features/workout/lib/handle-session-error";
import { setExerciseStatus } from "@/features/workout/lib/session-store";
import { apiError } from "@/lib/utils/http";

// ---------------------------------------------------------------------------
// PATCH /api/workout/today/exercise — mark one exercise done/skipped/pending.
// ---------------------------------------------------------------------------

type Body = {
  date: string;
  exerciseId: string;
  status: ExerciseLogStatus;
  note?: string;
};

const STATUSES: ExerciseLogStatus[] = ["pending", "done", "skipped"];

export async function PATCH(request: Request) {
  const userId = await requireUser();
  if (!userId) return apiError("You're not signed in.", 401, "UNAUTHORIZED");

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return apiError("Invalid JSON body.", 400, "INVALID_JSON");
  }

  if (
    !isUsableDate(body?.date) ||
    !body.exerciseId ||
    !STATUSES.includes(body.status)
  ) {
    return apiError("Invalid exercise update.", 400, "VALIDATION_ERROR");
  }

  let session;
  try {
    session = await setExerciseStatus(
      userId,
      body.date,
      body.exerciseId,
      body.status,
      body.note,
    );
  } catch (error) {
    return sessionStoreApiError(error);
  }
  if (!session) return apiError("No session for that date.", 404, "NOT_FOUND");

  return Response.json({ session });
}
