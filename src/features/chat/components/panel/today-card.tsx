"use client";

import { cn } from "cn";
import {
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  InfoIcon,
  Moon,
  NotebookPen,
  Play,
  SkipForward,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type {
  DayLog,
  Exercise,
  ExerciseLogStatus,
  TodayWorkout,
} from "@/features/chat/types";
import { exerciseImageUrl } from "@/lib/exercises/image-url";

type ExerciseState = { status: ExerciseLogStatus; note?: string };

/** Where an exercise sits in today's queue — drives how loudly it speaks. */
type RowVariant = "done" | "skipped" | "current" | "next" | "queued";

function todayDateKey() {
  return new Date().toISOString().slice(0, 10);
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

  // Borrowed from the phone mockup: the queue reads at a glance because only
  // one exercise is "now". Everything else is done, up next, or waiting.
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
      <motion.div
        initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="flex flex-col items-center gap-2 rounded-3xl border border-dashed border-border px-4 py-10 text-center"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-green-light text-primary">
          <CalendarClock size={20} aria-hidden />
        </span>
        <p className="text-sm font-medium">Ready for today?</p>
        <p className="max-w-60 text-xs leading-relaxed text-muted-foreground">
          Tell your coach in chat what you&apos;re going for and today&apos;s
          session will show up here.
        </p>
      </motion.div>
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
          transition={{ duration: 0.18, ease: "easeOut" }}
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
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="space-y-5"
        >
          {today.adjusted ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-start gap-2 overflow-hidden rounded-xl border border-info/30 bg-info/10 px-3 py-2 text-xs text-foreground"
            >
              <Sparkles
                size={13}
                className="mt-0.5 shrink-0 text-info"
                aria-hidden
              />
              <span>
                Adjusted for today: {today.adjusted.reason} —{" "}
                {today.adjusted.fromEquipment} → {today.adjusted.toEquipment}
              </span>
            </motion.div>
          ) : null}

          <TodaySessionHero
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
              <SectionDivider
                label={
                  isComplete
                    ? "Today's exercises · all checked off"
                    : "Today's exercises"
                }
              />

              <ul className="space-y-2">
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

              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key="hint"
                  exit={{ opacity: 0 }}
                  className="text-xs leading-relaxed text-muted-foreground flex items-center gap-2"
                >
                  <InfoIcon
                    size={14}
                    className="shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  Tap on the exercise to see how to do it, then mark it as done
                  or skipped.
                </motion.p>
              </AnimatePresence>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TodaySessionHero({
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
  const statusLine = isRestDay
    ? "No exercises planned today — take the time to recover."
    : isComplete
      ? `${total} of ${total} exercises checked off`
      : doneCount === 0
        ? `${today.minutes} min · ${total} exercises · ready when you are`
        : `${today.minutes} min · ${total - doneCount} exercise${total - doneCount === 1 ? "" : "s"} left`;

  return (
    <div className="rounded-3xl bg-primary p-5 text-primary-foreground">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-primary-foreground/70 uppercase">
            {isRestDay ? "Rest day" : `Today's session · ${today.dayLabel}`}
          </p>
          <p className="mt-1 text-xl font-bold">
            {isRestDay ? "Recovery" : today.focus}
          </p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={statusLine}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="mt-1.5 text-sm text-primary-foreground/80"
            >
              {statusLine}
            </motion.p>
          </AnimatePresence>
        </div>

        {isRestDay ? (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-foreground/15">
            <Moon size={18} aria-hidden />
          </span>
        ) : (
          <ProgressRing percent={percent} isComplete={isComplete} />
        )}
      </div>

      {isRestDay ? null : (
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/20"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${percent}% of today's exercises done`}
        >
          <motion.div
            className="h-full rounded-full bg-primary-foreground"
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 22 }}
          />
        </div>
      )}

      {/* The mockup's play button, made real: it opens the exercise you're on. */}
      {currentExercise && onOpenCurrent ? (
        <motion.button
          type="button"
          onClick={onOpenCurrent}
          whileTap={{ scale: 0.98 }}
          className="mt-4 flex min-h-[44px] w-full items-center gap-3 rounded-xl bg-primary-foreground/15 px-3 py-2.5 text-left transition-colors hover:bg-primary-foreground/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-foreground"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-primary">
            {doneCount === 0 ? (
              <Play size={14} className="ml-0.5 fill-current" aria-hidden />
            ) : (
              <Dumbbell size={15} aria-hidden />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[10px] font-semibold tracking-wider text-primary-foreground/70 uppercase">
              {doneCount === 0 ? "Start with" : "You're on"}
            </span>
            <span className="block truncate text-sm font-semibold">
              {currentExercise.name} · {currentExercise.sets} ×{" "}
              {currentExercise.reps}
            </span>
          </span>
          <ChevronRight
            size={16}
            className="shrink-0 text-primary-foreground/70"
            aria-hidden
          />
        </motion.button>
      ) : null}
    </div>
  );
}

function ProgressRing({
  percent,
  isComplete,
}: {
  percent: number;
  isComplete: boolean;
}) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  return (
    <div
      className="relative h-12 w-12 shrink-0"
      role="img"
      aria-label={isComplete ? "All exercises done" : `${percent}% done`}
    >
      <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90" aria-hidden>
        <title>{percent}% done</title>
        <circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          strokeWidth="4"
          className="stroke-primary-foreground/25"
        />
        <motion.circle
          cx="24"
          cy="24"
          r={radius}
          fill="none"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          className="stroke-primary-foreground"
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
          >
            <Check size={16} strokeWidth={3} aria-hidden />
          </motion.span>
        ) : (
          <span className="text-[11px] font-bold">{percent}%</span>
        )}
      </span>
    </div>
  );
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <p className="shrink-0 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {label}
      </p>
      <div className="h-px flex-1 bg-border" />
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
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
        aria-label="Done"
      >
        <Check size={12} strokeWidth={3} aria-hidden />
      </motion.span>
    );
  }
  if (variant === "skipped") {
    return (
      <span className="shrink-0 rounded-pill bg-muted px-2 py-1 text-[10px] font-semibold text-muted-foreground">
        Skipped
      </span>
    );
  }
  if (variant === "current") {
    return (
      <span className="shrink-0 rounded-pill bg-primary px-2 py-1 text-[10px] font-bold text-primary-foreground">
        NOW
      </span>
    );
  }
  if (variant === "next") {
    return (
      <span className="shrink-0 text-[10px] font-semibold text-muted-foreground">
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
      initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        delay: reduceMotion ? 0 : Math.min(index * 0.05, 0.25),
        ease: "easeOut",
        layout: { type: "spring", stiffness: 320, damping: 30 },
      }}
      className={cn(
        "rounded-xl border p-3 cursor-pointer",
        isCurrent
          ? "border-primary/40 bg-brand-green-light/50"
          : "border-border bg-card",
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpen}
          aria-label={`${exercise.name} — view how to do it`}
          className="flex min-h-[44px] min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <ExerciseThumbnail exercise={exercise} dimmed={isDone} />
          <span className="min-w-0">
            <span
              className={cn(
                "block truncate text-sm font-semibold",
                isDone && "text-muted-foreground",
                variant === "skipped" && "text-muted-foreground line-through",
              )}
            >
              {exercise.name}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {exercise.sets} × {exercise.reps} · {exercise.equipment}
            </span>
            {state.note ? (
              <span className="block truncate text-xs text-primary">
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
            <div className="flex gap-2 pt-3">
              <motion.button
                type="button"
                onClick={onQuickDone}
                whileTap={{ scale: 0.97 }}
                className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-pill bg-primary text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <Check size={13} strokeWidth={3} aria-hidden />
                Mark done
              </motion.button>
              <motion.button
                type="button"
                onClick={onQuickSkip}
                whileTap={{ scale: 0.97 }}
                className="flex h-10 items-center justify-center gap-1.5 rounded-pill border border-border bg-card px-4 text-xs font-semibold transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <SkipForward size={13} aria-hidden />
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

  function saveNote() {
    onSetStatus(state.status, noteDraft.trim() || undefined);
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex min-h-[44px] items-center gap-1 rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <ChevronLeft size={16} aria-hidden /> All exercises
      </button>

      <div className="flex items-center gap-3">
        <ExerciseThumbnail exercise={exercise} size={56} />
        <div className="min-w-0">
          <p
            className={cn(
              "text-base font-semibold",
              state.status === "skipped" &&
                "text-muted-foreground line-through",
            )}
          >
            {exercise.name}
          </p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span>
              {exercise.sets} × {exercise.reps} · {exercise.equipment}
            </span>
            {state.status !== "pending" ? (
              <span className="font-semibold text-primary capitalize">
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
              className="relative h-36 flex-1 overflow-hidden rounded-lg bg-muted"
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

      {/* Set breakdown, echoing the mockup's set chips. When the exercise is
          done the chips fill in — the closest honest read of "sets logged"
          with per-exercise (not per-set) logging. */}
      <div>
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Sets
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Array.from({ length: exercise.sets }, (_, i) => (
            <motion.span
              // biome-ignore lint/suspicious/noArrayIndexKey: chips are positional by definition — set 1, set 2…
              key={i}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.15 }}
              className={cn(
                "flex h-7 items-center gap-1 rounded-lg px-2.5 text-xs font-semibold",
                state.status === "done"
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {state.status === "done" ? (
                <Check size={10} strokeWidth={3} aria-hidden />
              ) : null}
              Set {i + 1} · {exercise.reps}
            </motion.span>
          ))}
        </div>
      </div>

      {exercise.instructions?.length ? (
        <ol className="list-decimal space-y-1.5 pl-4 text-sm leading-relaxed text-muted-foreground">
          {exercise.instructions.map((step, index) => (
            <li key={`${exercise.id}-step-${index}`}>{step}</li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">
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
            "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-pill border text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            state.status === "skipped"
              ? "border-foreground/60 bg-muted text-foreground"
              : "border-border bg-background hover:bg-muted",
          )}
        >
          <SkipForward size={14} aria-hidden />
          {state.status === "skipped" ? "Skipped" : "Skip"}
        </motion.button>
        <motion.button
          type="button"
          onClick={() => toggleStatus("done")}
          whileTap={{ scale: 0.97 }}
          className={cn(
            "flex h-11 flex-1 items-center justify-center gap-1.5 rounded-pill text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
            state.status === "done"
              ? "bg-brand-green-light text-primary"
              : "bg-primary text-primary-foreground hover:bg-primary/90",
          )}
        >
          <Check size={14} strokeWidth={3} aria-hidden />
          {state.status === "done" ? "Done" : "Mark done"}
        </motion.button>
      </div>

      {noteOpen ? (
        <div>
          <label
            htmlFor={`note-${exercise.id}`}
            className="text-xs font-medium text-muted-foreground"
          >
            Note for your coach
          </label>
          <textarea
            id={`note-${exercise.id}`}
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            onBlur={saveNote}
            rows={2}
            placeholder="e.g. did 2 sets of 8 at 20lb"
            className="mt-1.5 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setNoteOpen(true)}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-lg text-sm font-medium text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <NotebookPen size={13} aria-hidden /> Add a note
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
        className="flex shrink-0 items-center justify-center rounded-lg bg-muted"
      >
        <Dumbbell size={16} className="text-muted-foreground" aria-hidden />
      </div>
    );
  }
  return (
    <div
      style={style}
      className="relative shrink-0 overflow-hidden rounded-lg bg-muted"
    >
      <Image
        src={exerciseImageUrl(image)}
        alt=""
        fill
        sizes={`${size}px`}
        className={cn("object-cover", dimmed && "opacity-70")}
      />
    </div>
  );
}
