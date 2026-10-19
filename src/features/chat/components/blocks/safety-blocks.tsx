"use client";

import { HeartPulse, PhoneCall, ShieldAlert, Waves } from "lucide-react";
import { motion } from "motion/react";
import type { ChatBlock } from "@/features/chat/types";
import { BlockCard } from "../ui/controls";

type SafetyNoticeBlock = Extract<ChatBlock, { type: "safety_notice" }>;
type GentleRoutineBlock = Extract<ChatBlock, { type: "gentle_routine" }>;

/* Safety speaks in a different voice from the rest of the thread:
   warmer paper, a clear icon, and no cheerful colour. */

export function SafetyNoticeBlock({
  block,
  resolved,
  onAcknowledge,
}: {
  block: SafetyNoticeBlock;
  resolved: boolean;
  onAcknowledge: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="w-full max-w-md overflow-hidden rounded-[22px] border border-peach-edge bg-peach-tint"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-peach-ink">
          <ShieldAlert size={17} aria-hidden />
        </span>
        <p className="pt-1 text-[14px] leading-relaxed text-pretty text-ink-soft">
          {block.body}
        </p>
      </div>
      {resolved ? null : (
        <div className="border-t border-peach-edge/70 p-3">
          <motion.button
            type="button"
            onClick={onAcknowledge}
            whileTap={{ scale: 0.98 }}
            className="h-10 w-full rounded-full bg-ink text-[13px] font-semibold text-white transition-colors hover:bg-ink-soft"
          >
            {block.acknowledgeLabel}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

export function GentleRoutineBlock({ block }: { block: GentleRoutineBlock }) {
  return (
    <BlockCard className="max-w-md">
      <div className="flex items-center gap-2.5 bg-sky-tint px-4 py-3">
        <Waves size={15} className="shrink-0 text-sky-ink" aria-hidden />
        <p className="text-[12px] font-semibold text-sky-ink">
          Comfort movement · not a treatment plan
        </p>
      </div>

      <ul className="divide-y divide-line">
        {block.exercises.map((exercise, index) => (
          <motion.li
            key={exercise.name}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, delay: index * 0.05 }}
            className="flex items-center gap-3 px-4 py-3"
          >
            <span className="font-brand-mono text-[12px] text-ink-subtle">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-medium">
                {exercise.name}
              </span>
              <span className="block text-[12px] text-ink-muted">
                {exercise.detail}
              </span>
            </span>
          </motion.li>
        ))}
      </ul>

      <p className="border-t border-line px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
        Stop if anything increases pain, causes numbness, or feels wrong. A
        qualified clinician can help assess the cause.
      </p>
    </BlockCard>
  );
}

export function UrgentCareBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex w-full max-w-md items-start gap-3 rounded-[22px] border border-danger/25 bg-danger/5 p-4"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-danger">
        <HeartPulse size={17} aria-hidden />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-[14px] leading-snug font-semibold text-ink">
          Please seek medical care instead of exercising right now.
        </p>
        <p className="flex items-center gap-1.5 pt-1.5 text-[12px] text-ink-muted">
          <PhoneCall size={12} aria-hidden />A qualified clinician can safely
          assess what&apos;s going on.
        </p>
      </div>
    </motion.div>
  );
}
