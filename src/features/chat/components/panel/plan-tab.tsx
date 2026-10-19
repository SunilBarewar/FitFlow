"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import type { DayLog, Exercise, Plan, PlanDay } from "@/features/chat/types";
import { exerciseImageUrl } from "@/lib/exercises/image-url";
import { cn } from "@/lib/utils/cn";
import { Caret, KitMark, Tick, WeekMark } from "../ui/glyphs";

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

type WeekDayState = "done" | "today" | "upcoming" | "rest";

function todayName() {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

function orderFromToday(days: PlanDay[]): PlanDay[] {
  const index = days.findIndex((day) => day.label === todayName());
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

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.getTime();
}

/**
 * Monday–Sunday of the current week, matched against the plan.
 * Training days earlier this week count as done; today flips to done
 * once every exercise in the real log is marked done. Days with
 * nothing planned read as rest.
 */
function buildWeek(plan: Plan, todayLog: DayLog | null) {
  const now = new Date();
  // getDay() is Sunday-first (0 = Sun); shift so the week starts on Monday.
  const mondayOffset = now.getDay() === 0 ? -6 : 1 - now.getDay();
  const todayStart = startOfDay(now);

  return WEEKDAYS.map((label, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() + mondayOffset + index);
    const planDay = plan.days.find((day) => day.label === label);
    const isToday = date.toDateString() === now.toDateString();
    const isRest = !planDay || planDay.exercises.length === 0;

    let state: WeekDayState;
    if (isRest) {
      state = "rest";
    } else if (isToday) {
      const entries = todayLog?.dayLabel === label ? todayLog.entries : [];
      const allDone = planDay.exercises.every((exercise) =>
        entries.some(
          (entry) =>
            entry.exerciseId === exercise.id && entry.status === "done",
        ),
      );
      state = allDone ? "done" : "today";
    } else if (startOfDay(date) < todayStart) {
      state = "done";
    } else {
      state = "upcoming";
    }

    return { label, date, isToday, planDay, state };
  });
}

const WEEK_STATE_LABEL: Record<WeekDayState, string> = {
  done: "done",
  today: "today",
  upcoming: "coming up",
  rest: "rest day",
};

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
      <div className="flex flex-col items-center gap-2 rounded-[22px] border border-dashed border-line-strong px-5 py-12 text-center">
        <span className="flex size-10 items-center justify-center rounded-full bg-sky-tint text-sky-ink">
          <WeekMark size={20} />
        </span>
        <p className="pt-1 text-[15px] font-semibold">No plan yet</p>
        <p className="max-w-56 text-[13px] leading-relaxed text-ink-muted">
          Ask your coach for a weekly plan and it appears here for review.
        </p>
      </div>
    );
  }

  const selectedDay = plan.days.find((day) => day.id === selectedDayId);

  return (
    <AnimatePresence mode="wait" initial={false}>
      {selectedDay ? (
        <motion.div
          key={`day-${selectedDay.id}`}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <button
            type="button"
            onClick={() => setSelectedDayId(null)}
            className="inline-flex min-h-10 items-center gap-1 self-start text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            <Caret size={16} className="rotate-90" /> All days
          </button>

          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-brand-mono text-[11px] tracking-wide text-ink-subtle uppercase">
                {selectedDay.label}
              </p>
              <p className="pt-1 text-[20px] leading-tight font-medium tracking-tight">
                {selectedDay.exercises.length === 0
                  ? "Rest & recovery"
                  : selectedDay.focus}
              </p>
            </div>
            {selectedDay.exercises.length > 0 ? (
              <span className="shrink-0 rounded-full bg-sunken px-2.5 py-1 font-brand-mono text-[11px] text-ink-muted">
                {selectedDay.exercises.length}
              </span>
            ) : null}
          </div>

          {selectedDay.exercises.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {selectedDay.exercises.map((exercise) => (
                <PlanExerciseRow key={exercise.id} exercise={exercise} />
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center gap-1 rounded-[22px] border border-dashed border-line-strong py-12 text-center">
              <p className="text-[15px] font-semibold">Rest day</p>
              <p className="text-[13px] text-ink-muted">
                Nothing planned — recovery time.
              </p>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="overview"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="flex flex-col gap-4"
        >
          <PlanSummary plan={plan} todayLog={todayLog} />
          <WeekRow
            plan={plan}
            todayLog={todayLog}
            onSelectDay={setSelectedDayId}
          />
          <DayList plan={plan} onSelectDay={setSelectedDayId} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PlanSummary({
  plan,
  todayLog,
}: {
  plan: Plan;
  todayLog: DayLog | null;
}) {
  const totalExercises = plan.days.reduce(
    (sum, day) => sum + day.exercises.length,
    0,
  );
  const completedExercises =
    todayLog?.entries.filter((entry) => entry.status === "done").length ?? 0;

  return (
    <div className="rounded-[22px] border border-line bg-surface p-4 shadow-card">
      <p className="text-[20px] leading-tight font-medium tracking-tight">
        {plan.name}
      </p>
      <p className="pt-1 text-[13px] text-ink-muted">
        {plan.minutesPerSession} min a session ·{" "}
        {plan.status === "active" ? "Active" : "Draft"} · v{plan.version}
      </p>
      <div className="mt-3 flex items-center gap-2 border-t border-line pt-3">
        <span className="font-brand-mono text-[13px] text-ink">
          {completedExercises}/{totalExercises}
        </span>
        <span className="text-[12px] text-ink-muted">
          exercises logged today
        </span>
      </div>
    </div>
  );
}

/** The week as seven dots — the brand's rail, made interactive. */
function WeekRow({
  plan,
  todayLog,
  onSelectDay,
}: {
  plan: Plan;
  todayLog: DayLog | null;
  onSelectDay: (dayId: string) => void;
}) {
  const reduceMotion = useReducedMotion();
  const week = buildWeek(plan, todayLog);
  const doneCount = week.filter((day) => day.state === "done").length;

  return (
    <section
      aria-label="This week"
      className="rounded-[22px] border border-line bg-surface p-4 shadow-card"
    >
      <div className="flex items-center justify-between gap-2 pb-3">
        <p className="font-brand-mono text-[11px] tracking-wide text-ink-subtle uppercase">
          This week
        </p>
        {doneCount > 0 ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-mint-tint px-2 py-1 text-[11px] font-semibold text-mint-ink">
            <Tick size={11} />
            {doneCount} done
          </span>
        ) : null}
      </div>

      <ol className="flex items-start justify-between gap-1">
        {week.map((day, index) => {
          const content = (
            <>
              <span
                className={cn(
                  "text-[10px] leading-none font-semibold",
                  day.isToday ? "text-ink" : "text-ink-subtle",
                )}
              >
                {day.label[0]}
              </span>
              <motion.span
                initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 420,
                  damping: 22,
                  delay: reduceMotion ? 0 : index * 0.05,
                }}
                className={cn(
                  "flex size-9 items-center justify-center rounded-full font-brand-mono text-[12px]",
                  day.state === "done" && "bg-accent-edge text-white",
                  day.state === "today" &&
                    "border-2 border-accent-edge bg-accent-soft/50 text-ink",
                  day.state === "upcoming" && "bg-sunken text-ink-muted",
                  day.state === "rest" && "bg-sunken text-ink-subtle",
                )}
              >
                {day.state === "done" ? (
                  <Tick size={14} />
                ) : day.state === "rest" ? (
                  "–"
                ) : (
                  day.date.getDate()
                )}
              </motion.span>
            </>
          );

          const label = `${day.label} ${day.date.getDate()} — ${WEEK_STATE_LABEL[day.state]}`;

          return (
            <li key={day.label}>
              {day.planDay ? (
                <button
                  type="button"
                  onClick={() => onSelectDay(day.planDay?.id ?? "")}
                  aria-label={`${label}. View this day's workout`}
                  aria-current={day.isToday ? "date" : undefined}
                  className="flex min-h-11 flex-col items-center gap-1.5 rounded-xl px-1 py-1 transition-colors hover:bg-sunken"
                >
                  {content}
                </button>
              ) : (
                <div className="flex min-h-11 flex-col items-center gap-1.5 px-1 py-1">
                  <span className="sr-only">{label}</span>
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function DayList({
  plan,
  onSelectDay,
}: {
  plan: Plan;
  onSelectDay: (dayId: string) => void;
}) {
  const today = todayName();

  return (
    <ul className="overflow-hidden rounded-[22px] border border-line bg-surface shadow-card">
      {orderFromToday(plan.days).map((day) => {
        const isToday = day.label === today;
        const isRest = day.exercises.length === 0;
        const muscles = dayMuscles(day);

        return (
          <li key={day.id} className="border-b border-line last:border-b-0">
            <button
              type="button"
              onClick={() => onSelectDay(day.id)}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-sunken",
                isToday && "bg-accent-soft/25",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "size-2 shrink-0 rounded-full",
                  isToday
                    ? "bg-accent-edge"
                    : isRest
                      ? "bg-line-strong"
                      : "bg-ink-subtle",
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-semibold">
                    {isRest ? "Rest & recovery" : day.focus}
                  </span>
                  {isToday ? (
                    <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[9px] font-bold tracking-wide text-white">
                      TODAY
                    </span>
                  ) : null}
                </span>
                <span className="block truncate pt-0.5 text-[12px] text-ink-muted">
                  {day.label} ·{" "}
                  {isRest
                    ? "rest day"
                    : muscles ||
                      `${day.exercises.length} exercise${day.exercises.length === 1 ? "" : "s"}`}
                </span>
              </span>
              <span className="shrink-0 font-brand-mono text-[12px] text-ink-subtle">
                {isRest ? "–" : day.exercises.length}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

function PlanExerciseRow({ exercise }: { exercise: Exercise }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="overflow-hidden rounded-2xl border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 p-2.5 text-left"
      >
        <span className="flex min-w-0 items-center gap-3">
          <PlanThumbnail exercise={exercise} />
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-semibold">
              {exercise.name}
            </span>
            <span className="block truncate text-[12px] text-ink-muted">
              {exercise.sets} × {exercise.reps} · {exercise.equipment}
            </span>
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="shrink-0 text-ink-subtle"
        >
          <Caret size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 border-t border-line p-3">
              {exercise.images?.length ? (
                <div className="flex gap-2">
                  {exercise.images.slice(0, 2).map((image, index) => (
                    <div
                      key={image}
                      className="relative h-28 flex-1 overflow-hidden rounded-xl bg-sunken"
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
                <ol className="list-decimal space-y-1.5 pl-4 text-[12px] leading-relaxed text-ink-muted">
                  {exercise.instructions.map((step, index) => (
                    <li key={`${exercise.id}-step-${index}`}>{step}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-[12px] text-ink-muted">
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

function PlanThumbnail({ exercise }: { exercise: Exercise }) {
  const image = exercise.images?.[0];

  if (!image) {
    return (
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sunken">
        <KitMark id="dumbbell" size={20} className="text-line-strong" />
      </span>
    );
  }

  return (
    <span className="relative block size-11 shrink-0 overflow-hidden rounded-xl bg-sunken">
      <Image
        src={exerciseImageUrl(image)}
        alt=""
        fill
        sizes="44px"
        className="object-cover"
      />
    </span>
  );
}
