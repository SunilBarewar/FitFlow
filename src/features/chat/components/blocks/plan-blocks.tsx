"use client";

import { cn } from "cn";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Dumbbell,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import type { ChatBlock } from "@/features/chat/types";

type PlanCreatedBlock = Extract<ChatBlock, { type: "plan_created" }>;
type SessionMutationBlock = Extract<ChatBlock, { type: "session_mutation" }>;

export function PlanCreatedCard({
  block,
  onViewPlan,
}: {
  block: PlanCreatedBlock;
  onViewPlan: () => void;
}) {
  const { plan } = block;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green-light text-primary">
          <Sparkles size={16} aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{plan.name}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={12} aria-hidden /> {plan.daysPerWeek}{" "}
              days/week
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} aria-hidden /> {plan.minutesPerSession} min
            </span>
          </div>
        </div>
      </div>
      <div className="border-t border-border p-3">
        <button
          type="button"
          onClick={onViewPlan}
          className="h-10 w-full rounded-pill bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          See workout plan
        </button>
      </div>
    </motion.div>
  );
}

export function SessionMutationBlock({
  block,
  resolved,
  onStart,
  onKeep,
}: {
  block: SessionMutationBlock;
  resolved: boolean;
  onStart: () => void;
  onKeep: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-md rounded-2xl border border-border bg-card p-4"
    >
      <p className="text-sm font-semibold">Today's adjustment</p>
      <dl className="mt-3 space-y-2 text-sm">
        <Row
          label="Duration"
          from={`${block.fromMinutes} min`}
          to={`${block.toMinutes} min`}
        />
        <Row
          label="Equipment"
          from={block.fromEquipment}
          to={block.toEquipment}
        />
        <Row
          label="Intensity"
          from={block.fromIntensity}
          to={block.toIntensity}
        />
        <div className="flex items-center justify-between text-muted-foreground">
          <dt>Weekly plan</dt>
          <dd>Unchanged</dd>
        </div>
      </dl>
      {!resolved ? (
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onKeep}
            className="h-10 flex-1 rounded-pill border border-border text-sm font-medium transition-colors hover:bg-muted"
          >
            Keep original
          </button>
          <button
            type="button"
            onClick={onStart}
            className="h-10 flex-1 rounded-pill bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start adjusted
          </button>
        </div>
      ) : (
        <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-success">
          <Dumbbell size={14} aria-hidden /> Applied to today
        </p>
      )}
    </motion.div>
  );
}

function Row({ label, from, to }: { label: string; from: string; to: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn("flex items-center gap-1.5 font-medium")}>
        <span className="text-muted-foreground line-through">{from}</span>
        <ArrowRight size={12} aria-hidden className="text-muted-foreground" />
        <span>{to}</span>
      </dd>
    </div>
  );
}
