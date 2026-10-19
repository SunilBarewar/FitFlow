"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type {
  DayLog,
  Exercise,
  ExerciseLogStatus,
  TodayWorkout,
} from "@/features/chat/types";
import { toDateKey } from "@/lib/date/today";
import { exerciseImageUrl } from "@/lib/exercises/image-url";
import { cn } from "@/lib/utils/cn";
import {
  Caret,
  KitMark,
  NoteMark,
  PlayMark,
  RestMark,
  SkipMark,
  SwapMark,
  Tick,
} from "../ui/glyphs";

type ExerciseState = { status: ExerciseLogStatus; note?: string };

/** Where an exercise sits in today's queue — drives how loudly it speaks. */
type RowVariant = "done" | "skipped" | "current" | "next" | "queued";

function todayDateKey() {
  return toDateKey(new Date());
}

function stateFor(
  log: DayLog | null,
  dayLabel: string,
  exerciseId: string,
): ExerciseState {
  if (!log || log.date !== todayDateKey() || log.dayLabel !== dayLabel) {
    return { status: "pending" };
  }
  const entry = log.entries.find((item) => item.exerciseId === exerciseId);
  return entry
    ? { status: entry.status, note: entry.note ?? undefined }
    : { status: "pending" };
}

export function TodayCard({
  today,
  log,
  onSetExerciseLog,
}: {
  today: TodayWorkout | null;
  log: DayLog | null;
  onSetExerciseLog: (
    exerciseId: string,
    status: ExerciseLogStatus,
    note?: string,
  ) => void;
}) {
  const reduceMotion = useReducedMotion();
  const total = today?.exercises.length ?? 0;

  const states = useMemo(() => {
    if (!today) return new Map<string, ExerciseState>();
    return new Map(
      today.exercises.map((exercise) => [
        exercise.id,
        stateFor(log, today.dayLabel, exercise.id),
      ]),
    );
  }, [today, log]);

  const doneCount = useMemo(
    () =>
      [...states.values()].filter((state) => state.status === "done").length,
    [states],
  );
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const isRestDay = total === 0;

  // Only one exercise is ever "now" — everything else is done, next, or waiting.
  const currentExercise = today?.exercises.find(
    (exercise) => states.get(exercise.id)?.status === "pending",
  );
  const isComplete = total > 0 && !currentExercise;

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset the open exercise whenever the workout day changes.
  useEffect(() => {
    setSelectedExerciseId(null);
  }, [today?.dayLabel]);

  if (!today) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-[22px] border border-dashed border-line-strong px-5 py-12 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent-edge">
          <RestMark size={20} />
        </span>
        <p className="pt-1 text-[15px] font-semibold">Nothing planned yet</p>
        <p className="max-w-56 text-[13px] leading-relaxed text-ink-muted">
          Tell your coach what you&apos;re after and today&apos;s session shows
          up here.
        </p>
      </div>
    );
  }

  const selectedExercise = today.exercises.find(
    (exercise) => exercise.id === selectedExerciseId,
  );

  const variantFor = (exercise: Exercise): RowVariant => {
    const status = states.get(exercise.id)?.status ?? "pending";
    if (status !== "pending") return status;
    if (exercise.id === currentExercise?.id) return "current";
    const pending = today.exercises.filter(
      (item) => states.get(item.id)?.status === "pending",
    );
    return pending[1]?.id === exercise.id ? "next" : "queued";
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {selectedExercise ? (
        <motion.div
          key={`detail-${selectedExercise.id}`}
          initial={{ opacity: 0, x: reduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduceMotion ? 0 : 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <ExerciseDetailView
            exercise={selectedExercise}
            state={states.get(selectedExercise.id) ?? { status: "pending" }}
            onBack={() => setSelectedExerciseId(null)}
            onSetStatus={(status, note) =>
              onSetExerciseLog(selectedExercise.id, status, note)
            }
          />
        </motion.div>
      ) : (
        <motion.div
          key="list"
          initial={{ opacity: 0, x: reduceMotion ? 0 : -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: reduceMotion ? 0 : -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <AnimatePresence initial={false}>
            {today.adjusted ? (
              <motion.div
                key="adjusted"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="flex items-start gap-2 rounded-2xl border border-sky-edge bg-sky-tint px-3 py-2.5 text-[12px] leading-snug text-ink-soft">
                  <SwapMark
                    size={14}
                    className="mt-0.5 shrink-0 text-sky-ink"
                  />
                  <span>
                    Adjusted for today: {today.adjusted.reason} —{" "}
                    {today.adjusted.fromEquipment} →{" "}
                    {today.adjusted.toEquipment}
                  </span>
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <SessionHeader
            today={today}
            isRestDay={isRestDay}
            isComplete={isComplete}
            doneCount={doneCount}
            total={total}
            percent={percent}
            currentExercise={currentExercise}
            onOpenCurrent={
              currentExercise
                ? () => setSelectedExerciseId(currentExercise.id)
                : undefined
            }
          />

          {isRestDay ? null : (
            <>
              <ul className="flex flex-col gap-2">
                {today.exercises.map((exercise, index) => (
                  <ExerciseRow
                    key={exercise.id}
                    exercise={exercise}
                    state={states.get(exercise.id) ?? { status: "pending" }}
                    variant={variantFor(exercise)}
                    index={index}
                    onOpen={() => setSelectedExerciseId(exercise.id)}
                    onQuickDone={() => onSetExerciseLog(exercise.id, "done")}
                    onQuickSkip={() => onSetExerciseLog(exercise.id, "skipped")}
                  />
                ))}
              </ul>

              <p className="text-[12px] leading-relaxed text-ink-subtle">
                Tap an exercise to see how it&apos;s done, then mark it off.
              </p>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** The one card that answers "what am I doing right now?". */
function SessionHeader({
  today,
  isRestDay,
  isComplete,
  doneCount,
  total,
  percent,
  currentExercise,
  onOpenCurrent,
}: {
  today: TodayWorkout;
  isRestDay: boolean;
  isComplete: boolean;
  doneCount: number;
  total: number;
  percent: number;
  currentExercise?: Exercise;
  onOpenCurrent?: () => void;
}) {
  const left = total - doneCount;
  const statusLine = isRestDay
    ? "Nothing planned — recovery counts as training."
    : isComplete
      ? `All ${total} exercises done. Nice work.`
      : doneCount === 0
        ? `${today.minutes} min · ${total} exercises`
        : `${left} exercise${left === 1 ? "" : "s"} left · ${today.minutes} min`;

  return (
    <div className="overflow-hidden rounded-[22px] border border-line bg-surface shadow-card">
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="font-brand-mono text-[11px] tracking-wide text-ink-subtle uppercase">
            {isRestDay ? "Rest day" : `Today · ${today.dayLabel}`}
          </p>
          <p className="pt-1 text-[20px] leading-tight font-medium tracking-[-0.025em]">
            {isRestDay ? "Recovery" : today.focus}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={statusLine}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="pt-1 text-[13px] text-ink-muted"
            >
              {statusLine}
            </motion.p>
          </AnimatePresence>
        </div>

        {isRestDay ? (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sky-tint text-sky-ink">
            <RestMark size={20} />
          </span>
        ) : (
          <ProgressRing
            percent={percent}
            doneCount={doneCount}
            total={total}
            isComplete={isComplete}
          />
        )}
      </div>

      {currentExercise && onOpenCurrent ? (
        <motion.button
          type="button"
          onClick={onOpenCurrent}
          whileTap={{ scale: 0.99 }}
          className="flex w-full items-center gap-3 border-t border-line bg-accent-soft/30 px-4 py-3 text-left transition-colors hover:bg-accent-soft/50"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-white">
            {doneCount === 0 ? (
              <PlayMark size={14} className="ml-0.5" />
            ) : (
              <KitMark id="dumbbell" size={15} />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block font-brand-mono text-[10px] tracking-wider text-ink-subtle uppercase">
              {doneCount === 0 ? "Start with" : "You're on"}
            </span>
            <span className="block truncate text-[14px] font-semibold">
              {currentExercise.name} · {currentExercise.sets} ×{" "}
              {currentExercise.reps}
            </span>
          </span>
          <Caret size={16} className="-rotate-90 shrink-0 text-ink-subtle" />
        </motion.button>
      ) : null}
    </div>
  );
}

function ProgressRing({
  percent,
  doneCount,
  total,
  isComplete,
}: {
  percent: number;
  doneCount: number;
  total: number;
  isComplete: boolean;
}) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="relative size-12 shrink-0"
      role="img"
      aria-label={
        isComplete
          ? "All exercises done"
          : `${doneCount} of ${total} exercises done`
      }
    >
      {/* No <title> here: React 19 hoists it to the document head, which
          breaks hydration. The wrapper's role + aria-label name this. */}
      <svg
        viewBox="0 0 48 48"
        className="size-12 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          strokeWidth="4"
          className="stroke-line"
        />
        <motion.circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          className="stroke-accent-edge"
          initial={false}
          animate={{
            strokeDashoffset: circumference - (circumference * percent) / 100,
          }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        {isComplete ? (
          <motion.span
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 16 }}
            className="text-accent-edge"
          >
            <Tick size={16} />
          </motion.span>
        ) : (
          <span className="font-brand-mono text-[11px] text-ink-soft">
            {doneCount}/{total}
          </span>
        )}
      </span>
    </div>
  );
}

function StatusBadge({ variant }: { variant: RowVariant }) {
  if (variant === "done") {
    return (
      <motion.span
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 480, damping: 18 }}
        className="flex size-6 shrink-0 items-center justify-center rounded-full bg-mint-tint text-mint-ink"
        aria-label="Done"
      >
        <Tick size={12} />
      </motion.span>
    );
  }
  if (variant === "skipped") {
    return (
      <span className="shrink-0 rounded-full bg-sunken px-2 py-1 text-[10px] font-semibold text-ink-subtle">
        Skipped
      </span>
    );
  }
  if (variant === "current") {
    return (
      <span className="shrink-0 rounded-full bg-ink px-2 py-1 text-[10px] font-bold tracking-wide text-white">
        NOW
      </span>
    );
  }
  if (variant === "next") {
    return (
      <span className="shrink-0 text-[10px] font-semibold text-ink-subtle">
        Up next
      </span>
    );
  }
  return null;
}

function ExerciseRow({
  exercise,
  state,
  variant,
  index,
  onOpen,
  onQuickDone,
  onQuickSkip,
}: {
  exercise: Exercise;
  state: ExerciseState;
  variant: RowVariant;
  index: number;
  onOpen: () => void;
  onQuickDone: () => void;
  onQuickSkip: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const isCurrent = variant === "current";
  const isDone = variant === "done";

  return (
    <motion.li
      layout={!reduceMotion}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        delay: reduceMotion ? 0 : Math.min(index * 0.04, 0.2),
        ease: "easeOut",
        layout: { type: "spring", stiffness: 320, damping: 30 },
      }}
      className={cn(
        "overflow-hidden rounded-2xl border transition-colors",
        isCurrent
          ? "border-accent-edge/45 bg-accent-soft/25"
          : "border-line bg-surface",
      )}
    >
      <div className="flex items-center gap-2 p-2.5">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${exercise.name} — view how to do it`}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-3 rounded-xl text-left"
        >
          <ExerciseThumbnail exercise={exercise} dimmed={isDone} />
          <span className="min-w-0">
            <span
              className={cn(
                "block truncate text-[14px] font-semibold",
                isDone && "text-ink-subtle",
                variant === "skipped" && "text-ink-subtle line-through",
              )}
            >
              {exercise.name}
            </span>
            <span className="block truncate text-[12px] text-ink-muted">
              {exercise.sets} × {exercise.reps} · {exercise.equipment}
            </span>
            {state.note ? (
              <span className="block truncate text-[12px] text-accent-edge">
                “{state.note}”
              </span>
            ) : null}
          </span>
        </button>
        <StatusBadge variant={variant} />
      </div>

      {/* One-tap logging for the exercise you're on — no trip into the
          detail view mid-set, sweaty thumb and all. */}
      <AnimatePresence initial={false}>
        {isCurrent ? (
          <motion.div
            key="quick-actions"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex gap-2 px-2.5 pb-2.5">
              <motion.button
                type="button"
                onClick={onQuickDone}
                whileTap={{ scale: 0.97 }}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-ink text-[12px] font-semibold text-white transition-colors hover:bg-ink-soft"
              >
                <Tick size={13} />
                Mark done
              </motion.button>
              <motion.button
                type="button"
                onClick={onQuickSkip}
                whileTap={{ scale: 0.97 }}
                className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-4 text-[12px] font-semibold text-ink-soft transition-colors hover:bg-sunken"
              >
                <SkipMark size={13} />
                Skip
              </motion.button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  );
}

function ExerciseDetailView({
  exercise,
  state,
  onBack,
  onSetStatus,
}: {
  exercise: Exercise;
  state: ExerciseState;
  onBack: () => void;
  onSetStatus: (status: ExerciseLogStatus, note?: string) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(Boolean(state.note));
  const [noteDraft, setNoteDraft] = useState(state.note ?? "");

  function toggleStatus(target: ExerciseLogStatus) {
    const resolved = state.status === target ? "pending" : target;
    onSetStatus(resolved, noteDraft.trim() || undefined);
  }

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-10 items-center gap-1 self-start text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        <Caret size={16} className="rotate-90" /> All exercises
      </button>

      <div className="flex items-center gap-3">
        <ExerciseThumbnail exercise={exercise} size={52} />
        <div className="min-w-0">
          <p
            className={cn(
              "text-[17px] leading-tight font-medium tracking-[-0.02em]",
              state.status === "skipped" && "text-ink-subtle line-through",
            )}
          >
            {exercise.name}
          </p>
          <p className="pt-1 text-[12px] text-ink-muted">
            {exercise.sets} × {exercise.reps} · {exercise.equipment}
            {state.status !== "pending" ? (
              <span className="font-semibold text-accent-edge capitalize">
                {" "}
                · {state.status}
              </span>
            ) : null}
          </p>
        </div>
      </div>

      {exercise.images?.length ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex gap-2"
        >
          {exercise.images.slice(0, 2).map((image, index) => (
            <div
              key={image}
              className="relative h-36 flex-1 overflow-hidden rounded-2xl border border-line bg-sunken"
            >
              <Image
                src={exerciseImageUrl(image)}
                alt={`${exercise.name} — step ${index + 1}`}
                fill
                sizes="240px"
                className="object-cover"
              />
            </div>
          ))}
        </motion.div>
      ) : null}

      {/* Per-exercise logging, shown honestly: the chips fill in together
          when the exercise is marked done. */}
      <div>
        <p className="font-brand-mono text-[11px] tracking-wide text-ink-subtle uppercase">
          Sets
        </p>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {Array.from({ length: exercise.sets }, (_, index) => (
            <motion.span
              // biome-ignore lint/suspicious/noArrayIndexKey: chips are positional by definition — set 1, set 2…
              key={index}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.15 }}
              className={cn(
                "flex h-8 items-center gap-1 rounded-xl px-2.5 font-brand-mono text-[12px]",
                state.status === "done"
                  ? "bg-accent-soft text-ink"
                  : "bg-sunken text-ink-muted",
              )}
            >
              {state.status === "done" ? <Tick size={10} /> : null}
              {index + 1} · {exercise.reps}
            </motion.span>
          ))}
        </div>
      </div>

      {exercise.instructions?.length ? (
        <ol className="list-decimal space-y-1.5 pl-4 text-[13px] leading-relaxed text-ink-muted">
          {exercise.instructions.map((step, index) => (
            <li key={`${exercise.id}-step-${index}`}>{step}</li>
          ))}
        </ol>
      ) : (
        <p className="text-[13px] text-ink-muted">
          No step-by-step instructions on file for this one — ask your coach for
          form cues.
        </p>
      )}

      <div className="flex gap-2">
        <motion.button
          type="button"
          onClick={() => toggleStatus("skipped")}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border text-[13px] font-semibold transition-colors",
            state.status === "skipped"
              ? "border-line-strong bg-sunken text-ink"
              : "border-line bg-surface text-ink-soft hover:bg-sunken",
          )}
        >
          <SkipMark size={14} />
          {state.status === "skipped" ? "Skipped" : "Skip"}
        </motion.button>
        <motion.button
          type="button"
          onClick={() => toggleStatus("done")}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full text-[13px] font-semibold transition-colors",
            state.status === "done"
              ? "bg-accent-soft text-ink"
              : "bg-ink text-white hover:bg-ink-soft",
          )}
        >
          <Tick size={14} />
          {state.status === "done" ? "Done" : "Mark done"}
        </motion.button>
      </div>

      {noteOpen ? (
        <div>
          <label
            htmlFor={`note-${exercise.id}`}
            className="text-[12px] font-semibold text-ink-muted"
          >
            Note for your coach
          </label>
          <textarea
            id={`note-${exercise.id}`}
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            onBlur={() =>
              onSetStatus(state.status, noteDraft.trim() || undefined)
            }
            rows={2}
            placeholder="e.g. did 2 sets of 8 at 20 lb"
            className="mt-1.5 w-full resize-none rounded-2xl border border-line bg-surface px-3 py-2 text-[14px] outline-none transition-colors focus:border-accent-edge"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setNoteOpen(true)}
          className="inline-flex min-h-10 items-center gap-1.5 self-start text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          <NoteMark size={14} /> Add a note
        </button>
      )}
    </div>
  );
}

function ExerciseThumbnail({
  exercise,
  size = 44,
  dimmed = false,
}: {
  exercise: Exercise;
  size?: number;
  dimmed?: boolean;
}) {
  const image = exercise.images?.[0];
  const style = { height: size, width: size };

  if (!image) {
    return (
      <div
        style={style}
        className="flex shrink-0 items-center justify-center rounded-xl bg-sunken"
      >
        <KitMark id="dumbbell" size={20} className="text-line-strong" />
      </div>
    );
  }

  return (
    <div
      style={style}
      className="relative shrink-0 overflow-hidden rounded-xl bg-sunken"
    >
      <Image
        src={exerciseImageUrl(image)}
        alt=""
        fill
        sizes={`${size}px`}
        className={cn("object-cover", dimmed && "opacity-60")}
      />
    </div>
  );
}
