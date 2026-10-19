import type { Exercise, ExerciseLogStatus } from "@/features/chat/types";

export type SessionStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "skipped"
  | "rest";

export type SessionExerciseOrigin = "plan" | "added" | "swapped";

export type SessionExercise = Exercise & {
  order: number;
  origin: SessionExerciseOrigin;
  /** Set when origin is "swapped" — the plan exercise this one replaced. */
  replacesExerciseId?: string;
  status: ExerciseLogStatus;
  note?: string;
  completedAt?: string;
};

export type SessionAdjustment = {
  reason: string;
  source: "coach" | "user";
  fromMinutes?: number;
  toMinutes?: number;
  adjustedAt: string;
};

/** Serializable shape — what crosses into client components. */
export type WorkoutSession = {
  id: string;
  date: string;
  dayLabel: string;
  planId: string | null;
  planVersion: number | null;
  planDayId: string | null;
  focus: string;
  targetMinutes: number | null;
  status: SessionStatus;
  adjustment: SessionAdjustment | null;
  exercises: SessionExercise[];
  startedAt: string | null;
  completedAt: string | null;
};

export type WeekDaySummary = {
  date: string;
  dayLabel: string;
  status: SessionStatus;
  focus: string;
  doneCount: number;
  totalCount: number;
  isToday: boolean;
};

/** A day-scoped edit. Everything here changes today's session only — the
 * weekly plan is never touched. */
export type SessionAdjustmentPatch = {
  reason: string;
  source?: "coach" | "user";
  targetMinutes?: number;
  /** Exercise ids to drop from today. */
  remove?: string[];
  /** Catalog exercises to append to today. */
  add?: { exerciseId: string; sets?: number; reps?: string }[];
  /** Stand-ins for today: the original stays in the plan, not in this session. */
  replace?: {
    exerciseId: string;
    withExerciseId: string;
    sets?: number;
    reps?: string;
  }[];
};
