"use client";

import { cn } from "cn";
import {
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  Dumbbell,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import type { DayLog, Exercise, Plan, PlanDay } from "@/features/chat/types";
import { exerciseImageUrl } from "@/lib/exercises/image-url";

function orderFromToday(days: PlanDay[]): PlanDay[] {
  const todayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });
  const index = days.findIndex((day) => day.label === todayName);
  if (index <= 0) return days;
  return [...days.slice(index), ...days.slice(0, index)];
}

function dayMuscles(day: PlanDay): string {
  const unique = new Set<string>();
  for (const exercise of day.exercises) {
    for (const muscle of exercise.muscles ?? []) unique.add(muscle);
  }
  return Array.from(unique).join(", ");
}

export function PlanTab({
  plan,
  todayLog,
}: {
  plan: Plan | null;
  todayLog: DayLog | null;
}) {
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);

  if (!plan) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border px-4 py-10 text-center">
        <CalendarRange
          size={22}
          className="text-muted-foreground"
          aria-hidden
        />
        <p className="text-sm font-medium">No plan yet</p>
        <p className="text-xs text-muted-foreground">
          Ask your coach to build you a weekly plan and it'll appear here for
          review.
        </p>
      </div>
    );
  }

  const orderedDays = orderFromToday(plan.days);
  const todayName = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });
  const selectedDay = plan.days.find((day) => day.id === selectedDayId);

  if (selectedDay) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => setSelectedDayId(null)}
          className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft size={16} aria-hidden /> All days
        </button>

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold">
              {selectedDay.exercises.length === 0
                ? "Rest & Recovery"
                : selectedDay.focus}
            </p>
            <p className="text-xs text-muted-foreground">{selectedDay.label}</p>
          </div>
          {selectedDay.exercises.length > 0 ? (
            <span className="shrink-0 text-xs text-muted-foreground">
              {selectedDay.exercises.length} exercise
              {selectedDay.exercises.length === 1 ? "" : "s"}
            </span>
          ) : null}
        </div>

        {selectedDay.exercises.length > 0 ? (
          <ul className="space-y-2">
            {selectedDay.exercises.map((exercise) => (
              <PlanExerciseRow key={exercise.id} exercise={exercise} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-1 rounded-lg border border-dashed border-border py-10 text-center">
            <p className="text-sm font-medium">Rest day</p>
            <p className="text-xs text-muted-foreground">
              No exercises planned — recovery time.
            </p>
          </div>
        )}
      </div>
    );
  }

  const totalExercises = plan.days.reduce(
    (sum, day) => sum + day.exercises.length,
    0,
  );
  const completedExercises =
    todayLog?.entries.filter((entry) => entry.status === "done").length ?? 0;

  return (
    <div className="space-y-1">
      <div className="space-y-1 pb-3">
        <p className="text-xl font-bold tracking-tight">
          Your {plan.days.length}-day exercise plan
        </p>
        <p className="text-sm text-muted-foreground">
          {completedExercises} / {totalExercises} exercises completed
        </p>
        <p className="text-xs text-muted-foreground">
          {plan.name} · {plan.minutesPerSession} min/session ·{" "}
          {plan.status === "active" ? "Active" : "Draft"} v{plan.version}
        </p>
      </div>

      <ul className="overflow-hidden rounded-xl border border-border">
        {orderedDays.map((day) => {
          const isToday = day.label === todayName;
          const isRest = day.exercises.length === 0;
          const muscles = dayMuscles(day);

          return (
            <li key={day.id} className="border-b border-border last:border-b-0">
              <button
                type="button"
                onClick={() => setSelectedDayId(day.id)}
                className={cn(
                  "flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-muted/40",
                  isToday && "bg-primary/5",
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <span
                    className={cn(
                      "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                      isToday ? "border-primary" : "border-muted-foreground/30",
                    )}
                    aria-hidden
                  >
                    {isToday ? (
                      <span className="h-2 w-2 rounded-full bg-primary" />
                    ) : null}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-semibold">
                        {isRest ? "Rest & Recovery" : day.focus}
                      </p>
                      {isToday ? (
                        <span className="shrink-0 rounded-pill bg-primary/15 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-primary uppercase">
                          Today
                        </span>
                      ) : null}
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {isRest ? "Rest and recovery" : muscles || day.focus}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-medium text-muted-foreground">
                    {day.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isRest
                      ? "Rest day"
                      : `${day.exercises.length} exercise${day.exercises.length === 1 ? "" : "s"}`}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PlanExerciseRow({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="overflow-hidden rounded-lg border border-border bg-card">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <ExerciseThumbnail exercise={exercise} />
          <div className="min-w-0">
            <p className="text-sm font-medium">{exercise.name}</p>
            <p className="text-xs text-muted-foreground">
              {exercise.sets} × {exercise.reps} · {exercise.equipment}
            </p>
          </div>
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t border-border px-3 py-2.5">
              {exercise.images?.length ? (
                <div className="flex gap-2">
                  {exercise.images.slice(0, 2).map((image, index) => (
                    <div
                      key={image}
                      className="relative h-28 flex-1 overflow-hidden rounded-lg bg-muted"
                    >
                      <Image
                        src={exerciseImageUrl(image)}
                        alt={`${exercise.name} — step ${index + 1}`}
                        fill
                        sizes="200px"
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
                  No step-by-step instructions on file for this one.
                </p>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

function ExerciseThumbnail({ exercise }: { exercise: Exercise }) {
  const image = exercise.images?.[0];
  if (!image) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Dumbbell size={16} className="text-muted-foreground" aria-hidden />
      </div>
    );
  }
  return (
    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
      <Image
        src={exerciseImageUrl(image)}
        alt=""
        fill
        sizes="44px"
        className="object-cover"
      />
    </div>
  );
}
