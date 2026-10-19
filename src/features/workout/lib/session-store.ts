import "server-only";
import { type FlattenMaps, Types } from "mongoose";
import type { ExerciseLogStatus, Plan, PlanDay } from "@/features/chat/types";
import { toDayLabel, weekDateKeys } from "@/lib/date/today";
import { connectDB } from "@/lib/db";
import { getExerciseById } from "@/lib/exercises/exercise-catalog";
import { ConversationModel } from "@/models/conversation";
import {
  type WorkoutSessionDoc,
  WorkoutSessionModel,
} from "@/models/workout-session";
import { SessionImmutableError } from "./guards";
import type {
  SessionAdjustmentPatch,
  SessionExercise,
  SessionStatus,
  WeekDaySummary,
  WorkoutSession,
} from "../types";

type LeanSession = FlattenMaps<WorkoutSessionDoc> & { _id: Types.ObjectId };

/** Plain write shape for the exercises array — the inferred Mongoose type is a
 * DocumentArray, which can't be rebuilt from plain objects. */
type SessionExerciseWrite = {
  exerciseId: string;
  name: string;
  sets: number;
  reps: string;
  equipment: string;
  instructions: string[];
  muscles: string[];
  images: string[];
  order: number;
  origin: SessionExercise["origin"];
  replacesExerciseId: string | null;
  status: ExerciseLogStatus;
  note: string | null;
  completedAt: Date | null;
};

/** Lean subdocument → plain write shape. */
function toWrite(
  exercise: LeanSession["exercises"][number],
): SessionExerciseWrite {
  return {
    exerciseId: exercise.exerciseId,
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    equipment: exercise.equipment,
    instructions: [...(exercise.instructions ?? [])],
    muscles: [...(exercise.muscles ?? [])],
    images: [...(exercise.images ?? [])],
    order: exercise.order,
    origin: exercise.origin as SessionExercise["origin"],
    replacesExerciseId: exercise.replacesExerciseId ?? null,
    status: exercise.status as ExerciseLogStatus,
    note: exercise.note ?? null,
    completedAt: exercise.completedAt ? new Date(exercise.completedAt) : null,
  };
}

const DUPLICATE_KEY = 11000;

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: number }).code === DUPLICATE_KEY
  );
}

// ---------------------------------------------------------------------------
// Mapping
// ---------------------------------------------------------------------------

/** Hydrated subdocuments break RSC prop serialization — everything leaving
 * this module is a plain, JSON-safe object. */
function toDTO(session: LeanSession): WorkoutSession {
  return {
    id: session._id.toString(),
    date: session.date,
    dayLabel: session.dayLabel,
    planId: session.planId ?? null,
    planVersion: session.planVersion ?? null,
    planDayId: session.planDayId ?? null,
    focus: session.focus ?? "",
    targetMinutes: session.targetMinutes ?? null,
    status: session.status as SessionStatus,
    adjustment: session.adjustment
      ? {
          reason: session.adjustment.reason,
          source: (session.adjustment.source ?? "user") as "coach" | "user",
          fromMinutes: session.adjustment.fromMinutes ?? undefined,
          toMinutes: session.adjustment.toMinutes ?? undefined,
          adjustedAt: new Date(
            session.adjustment.adjustedAt ?? Date.now(),
          ).toISOString(),
        }
      : null,
    exercises: [...(session.exercises ?? [])]
      .sort((a, b) => a.order - b.order)
      .map((exercise) => ({
        id: exercise.exerciseId,
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        equipment: exercise.equipment,
        instructions: exercise.instructions ?? [],
        muscles: exercise.muscles ?? [],
        images: exercise.images ?? [],
        order: exercise.order,
        origin: exercise.origin as SessionExercise["origin"],
        replacesExerciseId: exercise.replacesExerciseId ?? undefined,
        status: exercise.status as ExerciseLogStatus,
        note: exercise.note ?? undefined,
        completedAt: exercise.completedAt
          ? new Date(exercise.completedAt).toISOString()
          : undefined,
      })),
    startedAt: session.startedAt
      ? new Date(session.startedAt).toISOString()
      : null,
    completedAt: session.completedAt
      ? new Date(session.completedAt).toISOString()
      : null,
  };
}

// ---------------------------------------------------------------------------
// Status derivation — one rule, so the chat panel, the home page and the
// coach can never disagree about what state a session is in.
// ---------------------------------------------------------------------------

export function deriveSessionStatus(
  exercises: { status: ExerciseLogStatus }[],
  current: SessionStatus,
): SessionStatus {
  if (exercises.length === 0) return "rest";
  const logged = exercises.filter((item) => item.status !== "pending").length;
  if (logged === 0) {
    // An explicitly skipped day stays skipped until something is logged.
    return current === "skipped" ? "skipped" : "not_started";
  }
  if (logged === exercises.length) {
    // Skip-the-day keeps "skipped"; logging every move as skipped finishes the session.
    if (current === "skipped") return "skipped";
    return "completed";
  }
  return "in_progress";
}

function assertSessionMutable(session: LeanSession): void {
  if (session.status === "completed") {
    throw new SessionImmutableError();
  }
}

// ---------------------------------------------------------------------------
// Materialization
// ---------------------------------------------------------------------------

async function getActivePlan(userId: Types.ObjectId): Promise<Plan | null> {
  const conversation = await ConversationModel.findOne({ userId })
    .select("hasPlan activePlan")
    .lean();
  if (!conversation?.hasPlan || !conversation.activePlan) return null;
  return conversation.activePlan as Plan;
}

function planDayFor(plan: Plan, dayLabel: string): PlanDay | null {
  return plan.days.find((day) => day.label === dayLabel) ?? null;
}

function buildExercises(day: PlanDay | null): SessionExerciseWrite[] {
  if (!day) return [];
  return day.exercises.map((exercise, index) => ({
    exerciseId: exercise.id,
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    equipment: exercise.equipment,
    instructions: exercise.instructions ?? [],
    muscles: exercise.muscles ?? [],
    images: exercise.images ?? [],
    order: index,
    origin: "plan",
    replacesExerciseId: null,
    status: "pending",
    note: null,
    completedAt: null,
  }));
}

function newSessionFields(plan: Plan, date: string, dayLabel: string) {
  const day = planDayFor(plan, dayLabel);
  const exercises = buildExercises(day);
  return {
    date,
    dayLabel,
    planId: plan.id,
    planVersion: plan.version,
    planDayId: day?.id ?? null,
    focus: day?.focus ?? "",
    targetMinutes: plan.minutesPerSession ?? null,
    status:
      exercises.length === 0 ? ("rest" as const) : ("not_started" as const),
    adjustment: null,
    exercises,
    startedAt: null,
    completedAt: null,
  };
}

/**
 * Find-or-create the session for a date.
 *
 * An existing session is returned as-is — it may have diverged from the plan
 * on purpose. The one exception is a still-untouched session whose plan no
 * longer matches the active one (the user adopted a new plan today before
 * logging anything); that gets rebuilt, which is what stops a new plan from
 * leaving a dead session behind.
 *
 * Returns null when there is no active plan — the caller redirects to /chat.
 */
export async function ensureSession(
  userId: string,
  date: string,
  dayLabel: string,
): Promise<WorkoutSession | null> {
  await connectDB();
  const userObjId = new Types.ObjectId(userId);

  const plan = await getActivePlan(userObjId);
  if (!plan) return null;

  const existing = await WorkoutSessionModel.findOne({
    userId: userObjId,
    date,
  }).lean<LeanSession | null>();

  if (existing) {
    const untouched =
      existing.status === "not_started" || existing.status === "rest";
    const stale = existing.planId !== plan.id;
    if (!untouched || !stale) return toDTO(existing);

    const rebuilt = await WorkoutSessionModel.findOneAndUpdate(
      { userId: userObjId, date },
      { $set: newSessionFields(plan, date, dayLabel) },
      { returnDocument: "after" },
    ).lean<LeanSession | null>();
    return rebuilt ? toDTO(rebuilt) : toDTO(existing);
  }

  try {
    const created = await WorkoutSessionModel.create({
      userId: userObjId,
      ...newSessionFields(plan, date, dayLabel),
    });
    return toDTO(created.toObject() as LeanSession);
  } catch (error) {
    // Two tabs opening the same day at once — the index settles it.
    if (!isDuplicateKeyError(error)) throw error;
    const raced = await WorkoutSessionModel.findOne({
      userId: userObjId,
      date,
    }).lean<LeanSession | null>();
    return raced ? toDTO(raced) : null;
  }
}

// ---------------------------------------------------------------------------
// Reads
// ---------------------------------------------------------------------------

export async function getSession(
  userId: string,
  date: string,
): Promise<WorkoutSession | null> {
  await connectDB();
  const session = await WorkoutSessionModel.findOne({
    userId: new Types.ObjectId(userId),
    date,
  }).lean<LeanSession | null>();
  return session ? toDTO(session) : null;
}

export async function getSessionRange(
  userId: string,
  from: string,
  to: string,
): Promise<WorkoutSession[]> {
  await connectDB();
  const sessions = await WorkoutSessionModel.find({
    userId: new Types.ObjectId(userId),
    date: { $gte: from, $lte: to },
  })
    .sort({ date: 1 })
    .lean<LeanSession[]>();
  return sessions.map(toDTO);
}

/**
 * The Monday-first week containing `today`. Dates without a session yet are
 * projected from the plan, so the strip is complete without materializing
 * sessions the user never opened.
 */
export async function getWeekSummary(
  userId: string,
  today: string,
): Promise<WeekDaySummary[]> {
  await connectDB();
  const userObjId = new Types.ObjectId(userId);

  const dates = weekDateKeys(today);
  const [plan, sessions] = await Promise.all([
    getActivePlan(userObjId),
    getSessionRange(userId, dates[0], dates[dates.length - 1]),
  ]);
  const byDate = new Map(sessions.map((session) => [session.date, session]));

  return dates.map((date) => {
    const dayLabel = toDayLabel(new Date(`${date}T00:00:00`));
    const session = byDate.get(date);

    if (session) {
      return {
        date,
        dayLabel,
        status: session.status,
        focus: session.focus,
        doneCount: session.exercises.filter((item) => item.status === "done")
          .length,
        totalCount: session.exercises.length,
        isToday: date === today,
      };
    }

    const day = plan ? planDayFor(plan, dayLabel) : null;
    const totalCount = day?.exercises.length ?? 0;
    return {
      date,
      dayLabel,
      status: totalCount === 0 ? ("rest" as const) : ("not_started" as const),
      focus: day?.focus ?? "",
      doneCount: 0,
      totalCount,
      isToday: date === today,
    };
  });
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

function timestampsFor(
  status: SessionStatus,
  session: Pick<LeanSession, "startedAt" | "completedAt">,
) {
  const now = new Date();
  const started =
    status === "not_started" || status === "rest"
      ? null
      : (session.startedAt ?? now);
  const completed =
    status === "completed" ? (session.completedAt ?? now) : null;
  return { startedAt: started, completedAt: completed };
}

/**
 * Log one exercise. If the id isn't in the session (the plan changed under a
 * stale client), it is resolved from the active plan day and appended rather
 * than dropped — a log the user believes they made must not vanish.
 */
export async function setExerciseStatus(
  userId: string,
  date: string,
  exerciseId: string,
  status: ExerciseLogStatus,
  note?: string,
): Promise<WorkoutSession | null> {
  await connectDB();
  const userObjId = new Types.ObjectId(userId);

  const session = await WorkoutSessionModel.findOne({
    userId: userObjId,
    date,
  }).lean<LeanSession | null>();
  if (!session) return null;
  assertSessionMutable(session);

  const exercises: SessionExerciseWrite[] = (session.exercises ?? []).map(
    toWrite,
  );
  const index = exercises.findIndex((item) => item.exerciseId === exerciseId);

  if (index >= 0) {
    exercises[index] = {
      ...exercises[index],
      status,
      note: note ?? null,
      completedAt: status === "done" ? new Date() : null,
    };
  } else {
    const plan = await getActivePlan(userObjId);
    const day = plan ? planDayFor(plan, session.dayLabel) : null;
    const fromPlan = day?.exercises.find((item) => item.id === exerciseId);
    if (!fromPlan) return toDTO(session);

    exercises.push({
      exerciseId: fromPlan.id,
      name: fromPlan.name,
      sets: fromPlan.sets,
      reps: fromPlan.reps,
      equipment: fromPlan.equipment,
      instructions: fromPlan.instructions ?? [],
      muscles: fromPlan.muscles ?? [],
      images: fromPlan.images ?? [],
      order: exercises.length,
      origin: "added",
      replacesExerciseId: null,
      status,
      note: note ?? null,
      completedAt: status === "done" ? new Date() : null,
    });
  }

  const nextStatus = deriveSessionStatus(
    exercises,
    session.status as SessionStatus,
  );
  const updated = await WorkoutSessionModel.findOneAndUpdate(
    { userId: userObjId, date },
    {
      $set: {
        exercises,
        status: nextStatus,
        ...timestampsFor(nextStatus, session),
      },
    },
    { returnDocument: "after" },
  ).lean<LeanSession | null>();

  return updated ? toDTO(updated) : null;
}

/** Explicit start / finish / skip-the-day / reset-to-untouched. */
export async function setSessionStatus(
  userId: string,
  date: string,
  status: SessionStatus,
): Promise<WorkoutSession | null> {
  await connectDB();
  const userObjId = new Types.ObjectId(userId);

  const session = await WorkoutSessionModel.findOne({
    userId: userObjId,
    date,
  }).lean<LeanSession | null>();
  if (!session) return null;

  if (session.status === "completed") {
    if (status === "completed") return toDTO(session);
    assertSessionMutable(session);
  }

  let exercises: SessionExerciseWrite[] = (session.exercises ?? []).map(
    toWrite,
  );

  if (status === "completed") {
    // Finishing closes the day — anything still open is skipped, not logged as done.
    exercises = exercises.map((item) =>
      item.status === "pending"
        ? { ...item, status: "skipped", completedAt: null }
        : item,
    );
  } else if (status === "skipped") {
    exercises = exercises.map((item) => ({
      ...item,
      status: "skipped",
      completedAt: null,
    }));
  } else if (status === "not_started") {
    exercises = exercises.map((item) => ({
      ...item,
      status: "pending",
      note: null,
      completedAt: null,
    }));
  }

  const updated = await WorkoutSessionModel.findOneAndUpdate(
    { userId: userObjId, date },
    {
      $set: {
        exercises,
        status,
        ...timestampsFor(
          status,
          status === "not_started"
            ? { startedAt: null, completedAt: null }
            : session,
        ),
      },
    },
    { returnDocument: "after" },
  ).lean<LeanSession | null>();

  return updated ? toDTO(updated) : null;
}

/** Build a session row from the catalog, for an exercise the plan didn't have. */
function fromCatalog(
  exerciseId: string,
  order: number,
  origin: SessionExercise["origin"],
  overrides: { sets?: number; reps?: string; replaces?: string } = {},
): SessionExerciseWrite | null {
  const catalog = getExerciseById(exerciseId);
  if (!catalog) return null;
  return {
    exerciseId: catalog.id,
    name: catalog.name,
    sets: overrides.sets ?? 3,
    reps: overrides.reps ?? "10",
    equipment: catalog.equipment ?? "body only",
    instructions: catalog.instructions ?? [],
    muscles: catalog.primaryMuscles ?? [],
    images: catalog.images ?? [],
    order,
    origin,
    replacesExerciseId: overrides.replaces ?? null,
    status: "pending",
    note: null,
    completedAt: null,
  };
}

/**
 * A day-scoped edit: shorter session, a dropped movement, a stand-in, an
 * extra finisher. The weekly plan is never touched — that is the whole point
 * of sessions existing.
 *
 * An exercise that is already marked done is never removed. It happened; the
 * session is a record, and records don't get rewritten by a later decision.
 */
export async function applySessionAdjustment(
  userId: string,
  date: string,
  patch: SessionAdjustmentPatch,
): Promise<WorkoutSession | null> {
  await connectDB();
  const userObjId = new Types.ObjectId(userId);

  const session = await WorkoutSessionModel.findOne({
    userId: userObjId,
    date,
  }).lean<LeanSession | null>();
  if (!session) return null;
  assertSessionMutable(session);

  let exercises: SessionExerciseWrite[] = (session.exercises ?? []).map(
    toWrite,
  );

  for (const swap of patch.replace ?? []) {
    const index = exercises.findIndex(
      (item) => item.exerciseId === swap.exerciseId,
    );
    if (index < 0) continue;
    const stand = fromCatalog(
      swap.withExerciseId,
      exercises[index].order,
      "swapped",
      {
        sets: swap.sets ?? exercises[index].sets,
        reps: swap.reps ?? exercises[index].reps,
        replaces: swap.exerciseId,
      },
    );
    if (stand) exercises[index] = stand;
  }

  if (patch.remove?.length) {
    const dropping = new Set(patch.remove);
    exercises = exercises.filter(
      (item) => !dropping.has(item.exerciseId) || item.status === "done",
    );
  }

  for (const addition of patch.add ?? []) {
    if (exercises.some((item) => item.exerciseId === addition.exerciseId))
      continue;
    const extra = fromCatalog(addition.exerciseId, exercises.length, "added", {
      sets: addition.sets,
      reps: addition.reps,
    });
    if (extra) exercises.push(extra);
  }

  // Order stays dense so the list reads 1..n after any edit.
  exercises = exercises.map((item, index) => ({ ...item, order: index }));

  const nextStatus = deriveSessionStatus(
    exercises,
    session.status as SessionStatus,
  );

  const updated = await WorkoutSessionModel.findOneAndUpdate(
    { userId: userObjId, date },
    {
      $set: {
        exercises,
        status: nextStatus,
        targetMinutes: patch.targetMinutes ?? session.targetMinutes ?? null,
        adjustment: {
          reason: patch.reason,
          source: patch.source ?? "user",
          fromMinutes: session.targetMinutes ?? null,
          toMinutes: patch.targetMinutes ?? session.targetMinutes ?? null,
          adjustedAt: new Date(),
        },
        ...timestampsFor(nextStatus, session),
      },
    },
    { returnDocument: "after" },
  ).lean<LeanSession | null>();

  return updated ? toDTO(updated) : null;
}

/**
 * Throw away today's divergence and rebuild from the current plan day.
 *
 * Restoring the *shape* of the session is not the same as un-doing the work:
 * anything already logged keeps its status and note, so putting the planned
 * exercises back can't quietly erase a set the user actually did.
 */
export async function resetSessionToPlan(
  userId: string,
  date: string,
  dayLabel: string,
): Promise<WorkoutSession | null> {
  await connectDB();
  const userObjId = new Types.ObjectId(userId);

  const plan = await getActivePlan(userObjId);
  if (!plan) return null;

  const existing = await WorkoutSessionModel.findOne({
    userId: userObjId,
    date,
  }).lean<LeanSession | null>();
  if (existing) assertSessionMutable(existing);

  const logged = new Map(
    (existing?.exercises ?? [])
      .filter((exercise) => exercise.status !== "pending")
      .map((exercise) => [exercise.exerciseId, toWrite(exercise)]),
  );

  const fields = newSessionFields(plan, date, dayLabel);
  const exercises = fields.exercises.map((exercise) => {
    const previous = logged.get(exercise.exerciseId);
    return previous
      ? {
          ...exercise,
          status: previous.status,
          note: previous.note,
          completedAt: previous.completedAt,
        }
      : exercise;
  });
  const status = deriveSessionStatus(exercises, fields.status as SessionStatus);

  const reset = await WorkoutSessionModel.findOneAndUpdate(
    { userId: userObjId, date },
    {
      $set: {
        ...fields,
        exercises,
        status,
        ...timestampsFor(status, {
          startedAt: existing?.startedAt ?? null,
          completedAt: existing?.completedAt ?? null,
        }),
      },
    },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true },
  ).lean<LeanSession | null>();

  return reset ? toDTO(reset) : null;
}

/** Everything for one user — used by "start a new chat", which promises to
 * erase logged progress along with the plan and history. */
export async function deleteAllSessions(userId: string): Promise<void> {
  await connectDB();
  await WorkoutSessionModel.deleteMany({ userId: new Types.ObjectId(userId) });
}
