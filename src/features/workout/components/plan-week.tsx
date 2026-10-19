"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Caret, WeekMark } from "@/features/chat/components/ui/glyphs";
import type { Plan } from "@/features/chat/types";
import { cn } from "@/lib/utils/cn";

/* The plan, read-only. Editing it durably is a conversation — the coach has
   the catalog and the reasoning — so this view links there instead of
   pretending to be an editor. */

export function PlanWeek({
  plan,
  todayLabel,
  onAskCoach,
}: {
  plan: Plan;
  todayLabel: string;
  onAskCoach: () => void;
}) {
  const [openDay, setOpenDay] = useState<string | null>(null);

  return (
    <section
      aria-label="Your weekly plan"
      className="rounded-[22px] border border-line bg-surface shadow-card"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-tint text-violet-ink">
          <WeekMark size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[15px] font-semibold">{plan.name}</h2>
          <p className="pt-0.5 text-[12.5px] text-ink-muted">
            {plan.daysPerWeek} days a week · {plan.minutesPerSession} min a
            session
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-1 px-2 pb-2">
        {plan.days.map((day) => {
          const isOpen = openDay === day.id;
          const isToday = day.label === todayLabel;
          const isRest = day.exercises.length === 0;

          return (
            <li key={day.id}>
              <button
                type="button"
                onClick={() => setOpenDay(isOpen ? null : day.id)}
                aria-expanded={isOpen}
                className={cn(
                  "flex min-h-12 w-full items-center gap-3 rounded-xl px-2.5 text-left transition-colors hover:bg-sunken",
                  isToday && "bg-accent-soft/30",
                )}
              >
                <span className="w-9 shrink-0 font-brand-mono text-[11px] text-ink-subtle uppercase">
                  {day.label.slice(0, 3)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-semibold">
                    {isRest ? "Rest" : day.focus}
                  </span>
                  <span className="block text-[12px] text-ink-muted">
                    {isRest ? "Recovery" : `${day.exercises.length} exercises`}
                  </span>
                </span>
                {isToday ? (
                  <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold text-white">
                    TODAY
                  </span>
                ) : null}
                {isRest ? null : (
                  <Caret
                    size={15}
                    className={cn(
                      "shrink-0 text-ink-subtle transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                )}
              </button>

              <AnimatePresence initial={false}>
                {isOpen && !isRest ? (
                  <motion.ul
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden pl-12"
                  >
                    {day.exercises.map((exercise) => (
                      <li
                        key={exercise.id}
                        className="flex items-baseline justify-between gap-3 py-1.5 text-[12.5px]"
                      >
                        <span className="min-w-0 truncate text-ink-soft">
                          {exercise.name}
                        </span>
                        <span className="shrink-0 font-brand-mono text-[11px] text-ink-subtle">
                          {exercise.sets} × {exercise.reps}
                        </span>
                      </li>
                    ))}
                  </motion.ul>
                ) : null}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-line p-3">
        <button
          type="button"
          onClick={onAskCoach}
          className="flex min-h-10 w-full items-center justify-center rounded-full text-[13px] font-semibold text-ink-muted transition-colors hover:text-ink"
        >
          Want to change the plan itself? Ask your coach
        </button>
      </div>
    </section>
  );
}
