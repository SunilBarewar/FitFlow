import type { DayLog } from "@/features/chat/types";
import type { WorkoutSession } from "../types";

/**
 * Sessions are the store; `DayLog` is the shape the chat panel has always
 * spoken. This mapper is the whole of the chat feature's awareness that the
 * storage changed — nothing under features/chat/ needs to know.
 *
 * Only logged exercises become entries, matching the old behavior where a
 * pending exercise simply had no row.
 */
export function sessionToDayLog(session: WorkoutSession): DayLog {
  return {
    date: session.date,
    dayLabel: session.dayLabel,
    entries: session.exercises
      .filter((exercise) => exercise.status !== "pending")
      .map((exercise) => ({
        exerciseId: exercise.id,
        status: exercise.status,
        note: exercise.note,
      })),
  };
}
