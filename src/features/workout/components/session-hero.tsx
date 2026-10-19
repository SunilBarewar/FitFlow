"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Caret,
  MinutesMark,
  PlayMark,
  RestMark,
  SwapMark,
  Tick,
} from "@/features/chat/components/ui/glyphs";
import { cn } from "@/lib/utils/cn";
import type { SessionExercise, WorkoutSession } from "../types";
import { SessionProgress } from "./session-progress";

/* The card that answers "what am I doing right now?" before anything else
   on the page gets a word in. */

export function SessionHero({
  session,
  doneCount,
  nextExercise,
  onStart,
  onOpenAdjust,
  onResetToPlan,
  pendingAction,
}: {
  session: WorkoutSession;
  doneCount: number;
  nextExercise?: SessionExercise;
  onStart: () => void;
  onOpenAdjust: () => void;
  onResetToPlan: () => void;
  pendingAction: string | null;
}) {
  const total = session.exercises.length;
  const isRest = session.status === "rest" || total === 0;
  const isComplete = session.status === "completed";
  const pendingCount = session.exercises.filter(
    (exercise) => exercise.status === "pending",
  ).length;

  const statusLine = isRest
    ? "Nothing planned — recovery counts as training."
    : isComplete
      ? `Session locked · ${doneCount} logged. Nice work.`
      : doneCount === 0
        ? `${session.targetMinutes ?? 45} min · ${total} exercises`
        : `${pendingCount} exercise${pendingCount === 1 ? "" : "s"} left · ${session.targetMinutes ?? 45} min`;

  return (
    <section className="overflow-hidden rounded-[26px] border border-line bg-surface shadow-card">
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <div className="min-w-0 flex-1">
          <p className="font-brand-mono text-[11px] tracking-wide text-ink-subtle uppercase">
            {isRest ? "Rest day" : `Today · ${session.dayLabel}`}
          </p>
          <h1 className="pt-1.5 text-[26px] leading-tight font-medium tracking-[-0.03em] sm:text-[30px]">
            {isRest ? "Recovery" : session.focus || "Today's session"}
          </h1>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={statusLine}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="pt-1.5 text-[14px] text-ink-muted"
            >
              {statusLine}
            </motion.p>
          </AnimatePresence>
        </div>

        {isRest ? (
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-sky-tint text-sky-ink">
            <RestMark size={24} />
          </span>
        ) : (
          <SessionProgress
            doneCount={doneCount}
            total={total}
            isComplete={isComplete}
          />
        )}
      </div>

      {session.adjustment && !isComplete ? (
        <div className="flex items-start gap-2 border-t border-line bg-sky-tint/60 px-5 py-3 sm:px-6">
          <SwapMark size={15} className="mt-0.5 shrink-0 text-sky-ink" />
          <p className="min-w-0 flex-1 text-[12.5px] leading-snug text-ink-soft">
            Adjusted for today: {session.adjustment.reason}
            {session.adjustment.toMinutes &&
            session.adjustment.fromMinutes &&
            session.adjustment.toMinutes !== session.adjustment.fromMinutes ? (
              <>
                {" "}
                · {session.adjustment.fromMinutes} →{" "}
                {session.adjustment.toMinutes} min
              </>
            ) : null}
          </p>
          <button
            type="button"
            onClick={onResetToPlan}
            disabled={pendingAction === "reset"}
            className="shrink-0 text-[12.5px] font-semibold text-sky-ink underline-offset-2 hover:underline disabled:opacity-50"
          >
            {pendingAction === "reset" ? "Restoring…" : "Restore plan"}
          </button>
        </div>
      ) : null}

      {isRest ? null : (
        <div
          className={cn(
            "border-t px-4 py-4 sm:px-5 sm:py-4",
            isComplete
              ? "rounded-b-[25px] border-mint-edge bg-mint-tint"
              : "border-line bg-sunken/40",
          )}
        >
          {isComplete ? (
            <div className="flex w-full items-start gap-3 sm:items-center">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-mint-edge bg-surface text-mint-ink">
                <Tick size={16} />
              </span>
              <span className="min-w-0 flex-1 pt-0.5">
                <span className="block text-[14px] font-semibold leading-snug text-mint-ink">
                  Session complete
                </span>
                <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink-soft">
                  {doneCount} of {total} logged · locked for today
                  <span className="text-ink-muted">
                    {" "}
                    · see you{" "}
                    {session.dayLabel === "Sunday" ? "Monday" : "tomorrow"}
                  </span>
                </span>
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              {nextExercise ? (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  onClick={onStart}
                  disabled={pendingAction !== null}
                  className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-full bg-ink px-4 text-left text-white transition-colors hover:bg-ink-soft disabled:opacity-60 p-3"
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-ink">
                    <PlayMark size={14} className="ml-0.5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-brand-mono text-[10px] tracking-wider text-accent-deep uppercase">
                      {doneCount === 0 ? "Start with" : "Up next"}
                    </span>
                    <span className="block truncate text-[14px] font-semibold">
                      {nextExercise.name} · {nextExercise.sets} ×{" "}
                      {nextExercise.reps}
                    </span>
                  </span>
                  <Caret
                    size={16}
                    className="-rotate-90 shrink-0 text-white/50"
                  />
                </motion.button>
              ) : null}

              <button
                type="button"
                onClick={onOpenAdjust}
                disabled={pendingAction !== null}
                className="flex h-11 min-w-0 items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-4 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-sunken disabled:opacity-50 sm:h-12 sm:flex-none sm:px-5"
              >
                <MinutesMark
                  size={15}
                  minutes={session.targetMinutes ?? 45}
                />
                Adjust today
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
