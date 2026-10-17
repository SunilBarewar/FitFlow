"use client";

import { cn } from "cn";
import { ArrowRight, CalendarDays, Clock, Dumbbell } from "lucide-react";
import { motion } from "motion/react";
import type { ChatBlock } from "@/features/chat/types";

type PlanPreviewBlock = Extract<ChatBlock, { type: "plan_preview" }>;
type SessionMutationBlock = Extract<ChatBlock, { type: "session_mutation" }>;

export function PlanPreviewBlock({
  block,
  resolved,
  onAccept,
  onDecline,
}: {
  block: PlanPreviewBlock;
  resolved: boolean;
  onAccept: () => void;
  onDecline: () => void;
}) {
  const { plan } = block;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="border-b border-border bg-brand-green-light/40 px-4 py-3">
        <p className="text-sm font-semibold">{plan.name}</p>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CalendarDays size={13} aria-hidden /> {plan.daysPerWeek} days/week
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock size={13} aria-hidden /> {plan.minutesPerSession} min
          </span>
        </div>
      </div>
      <ul className="divide-y divide-border">
        {plan.days.map((day) => (
          <li key={day.id} className="px-4 py-2.5">
            <p className="text-xs font-semibold text-muted-foreground">
              {day.label} · {day.focus}
            </p>
            <p className="mt-0.5 text-sm text-foreground">
              {day.exercises.map((e) => e.name).join(", ")}
            </p>
          </li>
        ))}
      </ul>
      {resolved ? (
        <div className="px-4 py-3 text-sm font-medium text-success">
          Plan activated
        </div>
      ) : (
        <div className="flex gap-2 p-3">
          <button
            type="button"
            onClick={onDecline}
            className="h-10 flex-1 rounded-pill border border-border text-sm font-medium transition-colors hover:bg-muted"
          >
            Change something
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="h-10 flex-1 rounded-pill bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Accept plan
          </button>
        </div>
      )}
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
