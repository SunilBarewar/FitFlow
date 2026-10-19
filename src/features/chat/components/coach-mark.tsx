"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils/cn";

/* The coach's presence in the thread: three dots in a honey circle —
   the week rail from the rest of the brand, shrunk to an avatar. When
   the coach is working, the dots breathe in sequence. */
export function CoachMark({
  working = false,
  className,
}: {
  working?: boolean;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-8 shrink-0 items-center justify-center gap-[3px] rounded-full bg-accent-soft",
        className,
      )}
    >
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="size-[5px] rounded-full bg-accent-edge"
          animate={
            working && !reduceMotion
              ? { opacity: [0.35, 1, 0.35], y: [0, -2, 0] }
              : { opacity: dot === 1 ? 1 : 0.55, y: 0 }
          }
          transition={
            working && !reduceMotion
              ? {
                  duration: 1.1,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                  delay: dot * 0.15,
                }
              : { duration: 0.2 }
          }
        />
      ))}
    </span>
  );
}
