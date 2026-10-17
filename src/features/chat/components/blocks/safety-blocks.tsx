"use client";

import { AlertTriangle, PhoneCall, ShieldAlert, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import type { ChatBlock } from "@/features/chat/types";

type SafetyNoticeBlock = Extract<ChatBlock, { type: "safety_notice" }>;
type GentleRoutineBlock = Extract<ChatBlock, { type: "gentle_routine" }>;

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
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-md rounded-2xl border border-warning/40 bg-warning/10 p-4"
    >
      <div className="flex items-start gap-2.5">
        <ShieldAlert
          size={18}
          className="mt-0.5 shrink-0 text-warning"
          aria-hidden
        />
        <p className="text-sm text-foreground">{block.body}</p>
      </div>
      {!resolved ? (
        <button
          type="button"
          onClick={onAcknowledge}
          className="mt-3 h-10 rounded-pill bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          {block.acknowledgeLabel}
        </button>
      ) : null}
    </motion.div>
  );
}

export function GentleRoutineBlock({ block }: { block: GentleRoutineBlock }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="flex items-center gap-2 border-b border-border bg-brand-sky-light/50 px-4 py-2.5">
        <Sparkles size={14} className="text-info" aria-hidden />
        <p className="text-xs font-semibold text-muted-foreground">
          General comfort movement · not a treatment plan
        </p>
      </div>
      <ul className="divide-y divide-border">
        {block.exercises.map((exercise) => (
          <li key={exercise.name} className="px-4 py-2.5">
            <p className="text-sm font-medium">{exercise.name}</p>
            <p className="text-xs text-muted-foreground">{exercise.detail}</p>
          </li>
        ))}
      </ul>
      <p className="px-4 py-2.5 text-xs text-muted-foreground">
        Stop if anything increases pain, causes numbness, or feels wrong. A
        qualified clinician can help assess the cause.
      </p>
    </motion.div>
  );
}

export function UrgentCareBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="flex w-full max-w-md items-start gap-2.5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4"
    >
      <AlertTriangle
        size={18}
        className="mt-0.5 shrink-0 text-destructive"
        aria-hidden
      />
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-foreground">
          Please seek appropriate medical care instead of exercising right now.
        </p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <PhoneCall size={12} aria-hidden /> A qualified clinician can safely
          assess what's going on.
        </p>
      </div>
    </motion.div>
  );
}
