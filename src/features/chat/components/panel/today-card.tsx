"use client";

import { cn } from "cn";
import {
  CalendarClock,
  Check,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Info,
  NotebookPen,
  SkipForward,
} from "lucide-react";
import { motion } from "motion/react";
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
  const total = today?.exercises.length ?? 0;
  const doneCount = useMemo(() => {
    if (!today) return 0;
    return today.exercises.filter(
      (exercise) =>
        stateFor(log, today.dayLabel, exercise.id).status === "done",
    ).length;
  }, [today, log]);
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const isRestDay = total === 0;

  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    null,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset the open exercise whenever the workout day changes.
  useEffect(() => {
    setSelectedExerciseId(null);
  }, [today?.dayLabel]);

  if (!today) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-10 text-center">
        <CalendarClock
          size={22}
          className="text-muted-foreground"
          aria-hidden
        />
        <p className="text-sm font-medium">No workout planned yet</p>
        <p className="text-xs text-muted-foreground">
          Tell your coach in chat what you're going for and today's session will
          show up here.
        </p>
      </div>
    );
  }

  const selectedExercise = today.exercises.find(
    (exercise) => exercise.id === selectedExerciseId,
  );

  // Opening an exercise takes over the whole card — only that exercise is
  // shown until the user goes back, instead of it appearing alongside the
  // hero/stats/list.
  if (selectedExercise) {
    return (
      <ExerciseDetailView
        exercise={selectedExercise}
        state={stateFor(log, today.dayLabel, selectedExercise.id)}
        onBack={() => setSelectedExerciseId(null)}
        onSetStatus={(status, note) =>
          onSetExerciseLog(selectedExercise.id, status, note)
        }
      />
    );
  }

  return (
    <div className="space-y-5">
      {today.adjusted ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl border border-info/30 bg-info/10 px-3 py-2 text-xs text-foreground"
        >
          Adjusted: {today.adjusted.reason} — {today.adjusted.fromEquipment} →{" "}
          {today.adjusted.toEquipment}
        </motion.div>
      ) : null}

      <TodaySessionHero
        today={today}
        isRestDay={isRestDay}
        doneCount={doneCount}
        total={total}
        percent={percent}
      />

      {isRestDay ? null : (
        <>
          <SectionDivider label="Today's exercises" />

          <ul className="space-y-2">
            {today.exercises.map((exercise) => (
              <ExerciseRow
                key={exercise.id}
                exercise={exercise}
                state={stateFor(log, today.dayLabel, exercise.id)}
                onOpen={() => setSelectedExerciseId(exercise.id)}
              />
            ))}
          </ul>

          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info size={13} className="mt-0.5 shrink-0" aria-hidden />
            Tap an exercise to see how to perform it, then mark it done or
            skipped.
          </p>
        </>
      )}
    </div>
  );
}

function TodaySessionHero({
  today,
  isRestDay,
  doneCount,
  total,
  percent,
}: {
  today: TodayWorkout;
  isRestDay: boolean;
  doneCount: number;
  total: number;
  percent: number;
}) {
  return (
    <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
      <p className="text-xs font-semibold tracking-wide text-primary-foreground/70 uppercase">
        {isRestDay ? "Rest day" : "Today's session"}
      </p>
      <p className="mt-1 text-xl font-bold">
        {isRestDay ? "Recovery" : today.focus}
      </p>
      <p className="mt-1.5 text-sm text-primary-foreground/80">
        {isRestDay
          ? "No exercises planned today — take the time to recover."
          : `${today.minutes} min · ${doneCount}/${total} exercises done`}
      </p>

      {isRestDay ? null : (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-primary-foreground/20">
          <motion.div
            className="h-full rounded-full bg-primary-foreground"
            initial={false}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          />
        </div>
      )}
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

function StatusDot({ status }: { status: ExerciseLogStatus }) {
  if (status === "done") {
    return (
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full bg-success"
        aria-hidden
      />
    );
  }
  if (status === "skipped") {
    return (
      <span
        className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-accent"
        aria-hidden
      />
    );
  }
  return (
    <span
      className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-muted-foreground/30"
      aria-hidden
    />
  );
}

function ExerciseRow({
  exercise,
  state,
  onOpen,
}: {
  exercise: Exercise;
  state: ExerciseState;
  onOpen: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          "flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
          state.status === "done"
            ? "border-success/40 bg-success/5"
            : "border-border bg-card",
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <StatusDot status={state.status} />
          <ExerciseThumbnail exercise={exercise} />
          <div className="min-w-0">
            <p
              className={cn(
                "text-sm font-medium",
                state.status === "skipped" &&
                  "text-muted-foreground line-through",
              )}
            >
              {exercise.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {exercise.equipment}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <span>
            {exercise.sets} × {exercise.reps}
          </span>
          <ChevronRight size={16} aria-hidden />
        </div>
      </button>
    </li>
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
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
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
          <p className="text-xs text-muted-foreground">
            {exercise.sets} × {exercise.reps} · {exercise.equipment}
          </p>
        </div>
      </div>

      {exercise.images?.length ? (
        <div className="flex gap-2">
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
        </div>
      ) : null}

      {exercise.instructions?.length ? (
        <ol className="list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-muted-foreground">
          {exercise.instructions.map((step, index) => (
            <li key={`${exercise.id}-step-${index}`}>{step}</li>
          ))}
        </ol>
      ) : (
        <p className="text-xs text-muted-foreground">
          No step-by-step instructions on file for this one — ask your coach for
          form cues.
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => toggleStatus("skipped")}
          className={cn(
            "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition-colors",
            state.status === "skipped"
              ? "border-foreground/60 bg-muted text-foreground"
              : "border-border bg-background hover:bg-muted",
          )}
        >
          <SkipForward size={13} aria-hidden />
          {state.status === "skipped" ? "Skipped" : "Skip"}
        </button>
        <button
          type="button"
          onClick={() => toggleStatus("done")}
          className={cn(
            "flex h-10 flex-1 items-center justify-center gap-1.5 rounded-lg border text-xs font-semibold transition-colors",
            state.status === "done"
              ? "border-success bg-success text-success-foreground"
              : "border-border bg-background hover:bg-muted",
          )}
        >
          <Check size={13} aria-hidden />
          {state.status === "done" ? "Done" : "Mark done"}
        </button>
      </div>

      {noteOpen ? (
        <textarea
          value={noteDraft}
          onChange={(event) => setNoteDraft(event.target.value)}
          onBlur={saveNote}
          rows={2}
          placeholder="e.g. did 2 sets of 8 at 20lb"
          className="w-full rounded-lg border border-border bg-background px-2.5 py-2 text-xs outline-none transition-colors focus:border-primary"
        />
      ) : (
        <button
          type="button"
          onClick={() => setNoteOpen(true)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary"
        >
          <NotebookPen size={12} aria-hidden /> Add a note
        </button>
      )}
    </div>
  );
}

function ExerciseThumbnail({
  exercise,
  size = 44,
}: {
  exercise: Exercise;
  size?: number;
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
        className="object-cover"
      />
    </div>
  );
}
