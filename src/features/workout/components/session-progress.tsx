"use client";

import { motion } from "motion/react";
import { Tick } from "@/features/chat/components/ui/glyphs";

/** The ring from the coach panel, sized for a page rather than a column. */
export function SessionProgress({
  doneCount,
  total,
  isComplete,
}: {
  doneCount: number;
  total: number;
  isComplete: boolean;
}) {
  const percent = total === 0 ? 0 : Math.round((doneCount / total) * 100);
  const radius = 26;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      className="relative size-16 shrink-0"
      role="img"
      aria-label={
        isComplete
          ? "All exercises done"
          : `${doneCount} of ${total} exercises done`
      }
    >
      <svg
        viewBox="0 0 64 64"
        className="size-16 -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="5"
          className="stroke-line"
        />
        <motion.circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          className="stroke-accent-edge"
          initial={false}
          animate={{
            strokeDashoffset: circumference - (circumference * percent) / 100,
          }}
          transition={{ type: "spring", stiffness: 90, damping: 20 }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">
        {isComplete ? (
          <motion.span
            initial={{ scale: 0.4 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 380, damping: 16 }}
            className="text-accent-edge"
          >
            <Tick size={20} />
          </motion.span>
        ) : (
          <span className="font-brand-mono text-[13px] text-ink-soft">
            {doneCount}/{total}
          </span>
        )}
      </span>
    </div>
  );
}
