"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Caret,
  MinutesMark,
  PlayMark,
  RestMark,
  SwapMark,
} from "@/features/chat/components/ui/glyphs";
import type { SessionExercise, WorkoutSession } from "../types";
import { SessionProgress } from "./session-progress";

/* The card that answers "what am I doing right now?" before anything else
   on the page gets a word in. */

export function SessionHero({
  session,
  doneCount,
  nextExercise,
  onStart,
  onFinish,
  onOpenAdjust,
  onResetToPlan,
  pendingAction,
}: {
  session: WorkoutSession;
  doneCount: number;
  nextExercise?: SessionExercise;
  onStart: () => void;
  onFinish: () => void;
  onOpenAdjust: () => void;
  onResetToPlan: () => void;
  pendingAction: string | null;
}) {
  const total = session.exercises.length;
  const isRest = session.status === "rest" || total === 0;
  const isComplete = session.status === "completed";
  const left = total - doneCount;

  const statusLine = isRest
    ? "Nothing planned — recovery counts as training."
    : isComplete
      ? `All ${total} exercises logged. Nice work.`
      : doneCount === 0
        ? `${session.targetMinutes ?? 45} min · ${total} exercises`
        : `${left} exercise${left === 1 ? "" : "s"} left · ${session.targetMinutes ?? 45} min`;

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

      {session.adjustment ? (
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
        <div className="flex flex-col gap-2 border-t border-line p-4 sm:flex-row sm:items-center sm:p-5">
          {isComplete ? (
            <p className="flex-1 text-[13.5px] font-semibold text-mint-ink">
              Session complete — see you{" "}
              {session.dayLabel === "Sunday" ? "Monday" : "tomorrow"}.
            </p>
          ) : (
            <motion.button
              type="button"
              whileTap={{ scale: 0.99 }}
              onClick={nextExercise ? onStart : onFinish}
              disabled={pendingAction !== null}
              className="flex h-12 flex-1 items-center gap-3 rounded-full bg-ink px-4 text-left text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15">
                <PlayMark size={14} className="ml-0.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-brand-mono text-[10px] tracking-wider text-white/60 uppercase">
                  {doneCount === 0 ? "Start with" : "You're on"}
                </span>
                <span className="block truncate text-[14px] font-semibold">
                  {nextExercise
                    ? `${nextExercise.name} · ${nextExercise.sets} × ${nextExercise.reps}`
                    : "Finish session"}
                </span>
              </span>
              <Caret size={16} className="-rotate-90 shrink-0 text-white/60" />
            </motion.button>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onOpenAdjust}
              disabled={pendingAction !== null}
              className="flex h-12 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-sunken disabled:opacity-50"
            >
              <MinutesMark size={15} minutes={session.targetMinutes ?? 45} />
              Adjust today
            </button>
            {!isComplete && doneCount > 0 ? (
              <button
                type="button"
                onClick={onFinish}
                disabled={pendingAction !== null}
                className="flex h-12 items-center rounded-full border border-line bg-surface px-4 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-sunken disabled:opacity-50"
              >
                {pendingAction === "status:completed" ? "Finishing…" : "Finish"}
              </button>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
