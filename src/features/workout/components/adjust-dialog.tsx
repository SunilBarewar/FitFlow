"use client";

import { useState } from "react";
import { Dialog, DialogCenterContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import type { SessionAdjustmentPatch, WorkoutSession } from "../types";

/* Day-scoped edits only. Everything here changes today and leaves the weekly
   plan alone — which is the whole reason sessions exist as their own thing.
   Choosing a *replacement* exercise needs the catalog and a coach's judgment,
   so that one hands off to the chat rather than faking a picker. */

const LENGTHS = [20, 30, 45, 60] as const;

const REASONS = [
  "Short on time",
  "Low energy",
  "Sore or in pain",
  "Travelling",
] as const;

export function AdjustDialog({
  open,
  onOpenChange,
  session,
  onApply,
  onSkipDay,
  onAskCoach,
  pending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: WorkoutSession;
  onApply: (patch: SessionAdjustmentPatch) => Promise<boolean>;
  onSkipDay: () => void;
  onAskCoach: () => void;
  pending: boolean;
}) {
  const [minutes, setMinutes] = useState<number>(session.targetMinutes ?? 45);
  const [reason, setReason] = useState<string>(REASONS[0]);
  const [trimIds, setTrimIds] = useState<string[]>([]);

  const trimmable = session.exercises.filter(
    (exercise) => exercise.status !== "done",
  );

  async function apply() {
    const ok = await onApply({
      reason,
      targetMinutes: minutes,
      remove: trimIds.length ? trimIds : undefined,
    });
    if (ok) {
      setTrimIds([]);
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !pending && onOpenChange(next)}>
      <DialogCenterContent
        title="Adjust today"
        description="Changes today's session only — your weekly plan stays as it is."
        className="max-w-md"
      >
        <fieldset className="mt-4">
          <legend className="font-brand-mono text-[11px] tracking-wide text-ink-subtle uppercase">
            How long do you have?
          </legend>
          <div className="flex flex-wrap gap-2 pt-2.5">
            {LENGTHS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setMinutes(value)}
                aria-pressed={minutes === value}
                className={cn(
                  "h-10 rounded-full border px-4 text-[13px] font-semibold transition-colors",
                  minutes === value
                    ? "border-ink bg-ink text-white"
                    : "border-line bg-surface text-ink-soft hover:bg-sunken",
                )}
              >
                {value} min
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="font-brand-mono text-[11px] tracking-wide text-ink-subtle uppercase">
            Why the change?
          </legend>
          <div className="flex flex-wrap gap-2 pt-2.5">
            {REASONS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setReason(value)}
                aria-pressed={reason === value}
                className={cn(
                  "h-10 rounded-full border px-4 text-[13px] font-semibold transition-colors",
                  reason === value
                    ? "border-accent-edge bg-accent-soft text-ink"
                    : "border-line bg-surface text-ink-soft hover:bg-sunken",
                )}
              >
                {value}
              </button>
            ))}
          </div>
        </fieldset>

        {trimmable.length > 0 ? (
          <fieldset className="mt-5">
            <legend className="font-brand-mono text-[11px] tracking-wide text-ink-subtle uppercase">
              Drop anything? (optional)
            </legend>
            <div className="mt-2.5 flex max-h-44 flex-col gap-1 overflow-y-auto rounded-2xl border border-line bg-sunken/50 p-1.5">
              {trimmable.map((exercise) => {
                const checked = trimIds.includes(exercise.id);
                return (
                  <label
                    key={exercise.id}
                    className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-xl px-2.5 text-[13px] transition-colors hover:bg-surface"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setTrimIds((prev) =>
                          checked
                            ? prev.filter((id) => id !== exercise.id)
                            : [...prev, exercise.id],
                        )
                      }
                      className="size-4 accent-[var(--color-ink)]"
                    />
                    <span
                      className={cn(
                        "min-w-0 flex-1 truncate font-medium",
                        checked && "text-ink-subtle line-through",
                      )}
                    >
                      {exercise.name}
                    </span>
                    <span className="shrink-0 font-brand-mono text-[11px] text-ink-subtle">
                      {exercise.sets} × {exercise.reps}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className="pt-1.5 text-[11.5px] text-ink-subtle">
              Anything already marked done stays in your log.
            </p>
          </fieldset>
        ) : null}

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void apply()}
            disabled={pending}
            className="flex h-11 w-full items-center justify-center rounded-full bg-ink px-4 text-[14px] font-semibold text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save today's changes"}
          </button>
          <button
            type="button"
            onClick={onAskCoach}
            className="flex h-11 w-full items-center justify-center rounded-full border border-line bg-surface px-4 text-[13.5px] font-semibold text-ink-soft transition-colors hover:bg-sunken"
          >
            Need different exercises? Ask your coach
          </button>
          <button
            type="button"
            onClick={onSkipDay}
            disabled={pending}
            className="flex h-11 w-full items-center justify-center rounded-full px-4 text-[13.5px] font-semibold text-ink-subtle transition-colors hover:text-danger disabled:opacity-50"
          >
            Skip today entirely
          </button>
        </div>
      </DialogCenterContent>
    </Dialog>
  );
}
