import {
  type HydratedDocument,
  type InferSchemaType,
  Schema,
  Types,
} from "mongoose";
import { registerModel } from "@/lib/db";

// ---------------------------------------------------------------------------
// One document per (user, calendar date) — the session the user actually does.
//
// `conversation.activePlan` is the template and changes rarely. A session is
// materialized as a copy of the matching plan day the first time that date is
// opened, and is then free to diverge: shorter today, a swapped exercise, an
// extra finisher. Day-scoped edits land here so the weekly plan stays intact.
//
// Exercise fields are denormalized on purpose — a session must stay a truthful
// record of what was done even after the plan it came from changes.
// ---------------------------------------------------------------------------

const sessionExerciseSchema = new Schema(
  {
    exerciseId: { type: String, required: true },
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true },
    equipment: { type: String, required: true },
    instructions: { type: [String], default: [] },
    muscles: { type: [String], default: [] },
    images: { type: [String], default: [] },

    /** Display order within the session. Dense, 0-based, re-packed on mutation. */
    order: { type: Number, required: true },

    /** Where this row came from, so the UI can mark "swapped for today". */
    origin: {
      type: String,
      enum: ["plan", "added", "swapped"],
      default: "plan",
    },
    /** When origin is "swapped": the plan exercise this one stands in for. */
    replacesExerciseId: { type: String, default: null },

    status: {
      type: String,
      enum: ["pending", "done", "skipped"],
      default: "pending",
    },
    note: { type: String, default: null },
    completedAt: { type: Date, default: null },
  },
  { _id: false },
);

const sessionAdjustmentSchema = new Schema(
  {
    reason: { type: String, required: true },
    source: { type: String, enum: ["coach", "user"], default: "user" },
    fromMinutes: { type: Number, default: null },
    toMinutes: { type: Number, default: null },
    adjustedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const workoutSessionSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true, index: true },

    /** Local calendar date, "YYYY-MM-DD" — see src/lib/date/today.ts. */
    date: { type: String, required: true },
    /** The weekday `date` falls on, e.g. "Monday". */
    dayLabel: { type: String, required: true },

    /** Provenance: which plan this session was materialized from. */
    planId: { type: String, default: null },
    planVersion: { type: Number, default: null },
    planDayId: { type: String, default: null },

    focus: { type: String, default: "" },
    targetMinutes: { type: Number, default: null },

    status: {
      type: String,
      enum: ["not_started", "in_progress", "completed", "skipped", "rest"],
      default: "not_started",
      index: true,
    },

    /**
     * Set when the session diverges from its plan day ("30 min today",
     * "shoulder pain"). Descriptive only — the divergence itself lives in
     * `exercises` and `targetMinutes`.
     */
    adjustment: { type: sessionAdjustmentSchema, default: null },

    exercises: { type: [sessionExerciseSchema], default: [] },

    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// One session per user per calendar date.
workoutSessionSchema.index({ userId: 1, date: 1 }, { unique: true });
// History reads: "this week", "last 30 days".
workoutSessionSchema.index({ userId: 1, date: -1 });

export type WorkoutSessionDoc = InferSchemaType<typeof workoutSessionSchema>;
export type WorkoutSessionDocument = HydratedDocument<WorkoutSessionDoc>;

export const WorkoutSessionModel = registerModel<WorkoutSessionDoc>(
  "WorkoutSession",
  workoutSessionSchema,
);
