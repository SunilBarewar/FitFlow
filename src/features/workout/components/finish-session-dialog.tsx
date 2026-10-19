"use client";

import { Dialog, DialogCenterContent } from "@/components/ui/dialog";
import { InfoMark, SkipMark, Tick } from "@/features/chat/components/ui/glyphs";
import type { SessionExercise } from "../types";

/* Finishing closes the day. This is the one moment where stopping to read
   is worth it — so it reads like the app (warm surface, glyphs, a sunken
   list of exactly what will be skipped) instead of a stock alert.
   Mirrors the reset confirmation in the chat header. */

export function FinishSessionDialog({
  open,
  onOpenChange,
  pendingExercises,
  doneCount,
  onConfirm,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingExercises: SessionExercise[];
  doneCount: number;
  onConfirm: () => void;
  pending: boolean;
}) {
  const pendingCount = pendingExercises.length;
  const hasOpenExercises = pendingCount > 0;
  const loggedLabel =
    doneCount === 1 ? "1 exercise logged" : `${doneCount} exercises logged`;

  const intro = hasOpenExercises
    ? doneCount > 0
      ? `${loggedLabel}. If you finish now, ${pendingCount === 1 ? "this one" : "these"} won't count as done:`
      : pendingCount === 1
        ? "Nothing logged yet. Finishing will skip this one:"
        : `Nothing logged yet. Finishing will skip these ${pendingCount}:`
    : doneCount > 0
      ? `${loggedLabel} — nothing left on the list. Finish when you're ready to save today's workout.`
      : "Nothing logged yet. Finishing will skip the rest of today's plan.";

  const footnote = hasOpenExercises
    ? "Skipped moves don't go in your done count. After you finish, today's log is locked — no edits or adjustments."
    : "After you finish, today's log is locked — no edits or adjustments.";

  const confirmLabel = hasOpenExercises
    ? pendingCount === 1
      ? "Finish and skip 1 exercise"
      : `Finish and skip ${pendingCount} exercises`
    : "Finish workout";

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogCenterContent
        title="Finish for today?"
        className="w-[calc(100vw-2rem)] rounded-[26px] border-line bg-surface p-5 shadow-card sm:p-6"
      >
        <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
          {intro}
        </p>

        {hasOpenExercises ? (
          <ul className="mt-3.5 flex max-h-44 flex-col gap-1 overflow-y-auto rounded-2xl border border-line bg-sunken/60 p-1.5">
            {pendingExercises.map((exercise) => (
              <li
                key={exercise.id}
                className="flex min-h-10 items-center gap-2.5 rounded-xl px-2.5 text-[13px]"
              >
                <SkipMark size={14} className="shrink-0 text-ink-subtle" />
                <span className="min-w-0 flex-1 truncate font-medium">
                  {exercise.name}
                </span>
                <span className="shrink-0 font-brand-mono text-[11px] text-ink-subtle">
                  {exercise.sets} × {exercise.reps}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="mt-3 flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-muted">
          <InfoMark size={14} className="mt-0.5 shrink-0 text-accent-edge" />
          <span>{footnote}</span>
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-4 text-[14px] font-semibold text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
          >
            <Tick size={14} />
            {pending ? "Finishing…" : confirmLabel}
          </button>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={pending}
            className="flex h-12 w-full items-center justify-center rounded-full border border-line bg-surface px-4 text-[14px] font-semibold text-ink-soft transition-colors hover:bg-sunken disabled:opacity-50"
          >
            Not yet
          </button>
        </div>
      </DialogCenterContent>
    </Dialog>
  );
}
