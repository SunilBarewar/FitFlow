"use client";

import { cn } from "cn";
import { Check, Clock, Flame, Info } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import type { TodayWorkout } from "@/features/chat/types";

export function TodayCard({ today }: { today: TodayWorkout }) {
  const [loggedSets, setLoggedSets] = useState<Set<string>>(new Set());

  const totalSets = useMemo(
    () => today.exercises.reduce((sum, ex) => sum + ex.sets, 0),
    [today.exercises],
  );
  const doneCount = loggedSets.size;
  const percent =
    totalSets === 0 ? 0 : Math.round((doneCount / totalSets) * 100);

  function toggleSet(key: string) {
    setLoggedSets((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  return (
    <div className="space-y-4">
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

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold">
            {today.dayLabel} · {today.focus}
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={12} aria-hidden /> {today.minutes} min planned
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-pill bg-muted px-3 py-1.5 text-xs font-medium">
          <Flame size={13} className="text-accent" aria-hidden />
          {doneCount}/{totalSets} sets
        </div>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </div>

      <ul className="space-y-3">
        {today.exercises.map((exercise) => (
          <li key={exercise.id} className="rounded-xl border border-border p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{exercise.name}</p>
              <span className="text-xs text-muted-foreground">
                {exercise.sets} × {exercise.reps} · {exercise.equipment}
              </span>
            </div>
            <div className="mt-2 flex gap-1.5">
              {Array.from({ length: exercise.sets }).map((_, setIndex) => {
                const key = `${exercise.id}-${setIndex}`;
                const done = loggedSets.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleSet(key)}
                    aria-pressed={done}
                    aria-label={`Set ${setIndex + 1} of ${exercise.name}, ${done ? "logged" : "not logged"}`}
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-semibold transition-colors",
                      done
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {done ? <Check size={14} aria-hidden /> : setIndex + 1}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>

      <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
        <Info size={13} className="mt-0.5 shrink-0" aria-hidden />
        Tap a set number to log it directly, or ask your coach in chat to adjust
        today's session.
      </p>
    </div>
  );
}
