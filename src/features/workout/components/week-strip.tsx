"use client";

import { motion, useReducedMotion } from "motion/react";
import { Tick } from "@/features/chat/components/ui/glyphs";
import { cn } from "@/lib/utils/cn";
import type { WeekDaySummary } from "../types";

/* Seven dots, Monday first. Done days fill in, today wears the ink ring,
   rest days stay quiet. It answers "where am I in the week?" at a glance
   and nothing else — tapping a past day is a later feature. */

export function WeekStrip({ week }: { week: WeekDaySummary[] }) {
  const reduceMotion = useReducedMotion();
  const trained = week.filter((day) => day.status === "completed").length;
  const planned = week.filter((day) => day.totalCount > 0).length;

  return (
    <section
      aria-label="This week"
      className="rounded-[22px] border border-line bg-surface p-4 shadow-card"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-brand-mono text-[11px] tracking-wide text-ink-subtle uppercase">
          This week
        </h2>
        <p className="text-[12px] text-ink-muted">
          <span className="font-semibold text-ink">{trained}</span> of {planned}{" "}
          sessions done
        </p>
      </div>

      <ol className="flex gap-1.5 pt-3">
        {week.map((day, index) => (
          <motion.li
            key={day.date}
            initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.2,
              delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.15),
            }}
            className="min-w-0 flex-1"
          >
            <DayDot day={day} />
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

function DayDot({ day }: { day: WeekDaySummary }) {
  const isRest = day.totalCount === 0;
  const label = `${day.dayLabel}${day.isToday ? ", today" : ""} — ${describe(day)}`;

  return (
    <div
      role="img"
      aria-label={label}
      title={label}
      className="flex flex-col items-center gap-1.5"
    >
      <span aria-hidden className="font-brand-mono text-[10px] text-ink-subtle">
        {day.dayLabel.slice(0, 1)}
      </span>
      <span
        aria-hidden
        className={cn(
          "flex h-9 w-full items-center justify-center rounded-xl border text-[11px] font-semibold transition-colors",
          day.status === "completed" &&
            "border-mint-edge bg-mint-tint text-mint-ink",
          day.status === "in_progress" &&
            "border-accent-edge/45 bg-accent-soft/40 text-accent-edge",
          day.status === "skipped" && "border-line bg-sunken text-ink-subtle",
          isRest &&
            day.status !== "completed" &&
            "border-dashed border-line text-ink-subtle",
          !isRest &&
            day.status === "not_started" &&
            "border-line bg-surface text-ink-soft",
          day.isToday && "ring-2 ring-ink ring-offset-1 ring-offset-surface",
        )}
      >
        {day.status === "completed" ? (
          <Tick size={13} />
        ) : isRest ? (
          "—"
        ) : (
          <span className="font-brand-mono">
            {day.doneCount}/{day.totalCount}
          </span>
        )}
      </span>
    </div>
  );
}

function describe(day: WeekDaySummary): string {
  if (day.totalCount === 0) return "rest day";
  if (day.status === "completed") return `${day.focus} · done`;
  if (day.status === "skipped") return `${day.focus} · skipped`;
  if (day.status === "in_progress") {
    return `${day.focus} · ${day.doneCount} of ${day.totalCount} done`;
  }
  return `${day.focus} · ${day.totalCount} exercises`;
}
