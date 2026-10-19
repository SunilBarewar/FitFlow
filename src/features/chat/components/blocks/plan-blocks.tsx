"use client";

import { cn } from "cn";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  Dumbbell,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
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

type ExerciseOptionsBlock = Extract<ChatBlock, { type: "exercise_options" }>;
type ExerciseSwapBlock = Extract<ChatBlock, { type: "exercise_swap" }>;

export function ExerciseOptionsBlock({
  block,
  resolved,
  onSelect,
  onPersistSubmit,
}: {
  block: ExerciseOptionsBlock;
  resolved: boolean;
  onSelect: (exerciseId: string, name: string) => void;
  onPersistSubmit: (exerciseId: string) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(
    block.selected ?? null,
  );

  function handleSelect(exerciseId: string, name: string) {
    setSelectedId(exerciseId);
    onPersistSubmit(exerciseId);
    onSelect(exerciseId, name);
  }

  const chosen = block.options.find((o) => o.exerciseId === selectedId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="px-4 pb-1 pt-3.5">
        <p className="text-xs font-medium text-muted-foreground">
          {block.sessionLabel}
        </p>
        <p className="mt-0.5 text-sm font-semibold">
          Replace{" "}
          <span className="text-muted-foreground line-through">
            {block.replacing.name}
          </span>
        </p>
      </div>
      <div className="mt-2 divide-y divide-border border-t border-border">
        {(resolved && chosen ? [chosen] : block.options).map((option) => {
          const isSelected = option.exerciseId === selectedId;
          return (
            <div
              key={option.exerciseId}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                isSelected && "bg-muted/50",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-tight">
                  {option.name}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    {option.equipment}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {option.primaryMuscles.slice(0, 2).join(", ")}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {option.sets} × {option.reps}
                </p>
              </div>
              {resolved || selectedId ? (
                isSelected ? (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check size={14} aria-hidden />
                  </span>
                ) : null
              ) : (
                <button
                  type="button"
                  onClick={() => handleSelect(option.exerciseId, option.name)}
                  className="h-8 shrink-0 rounded-pill bg-primary px-3 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Use this
                </button>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export function ExerciseSwapBlock({ block }: { block: ExerciseSwapBlock }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card"
    >
      <div className="flex items-center justify-between px-4 pb-2 pt-3.5">
        <p className="text-xs font-medium text-muted-foreground">
          {block.sessionLabel}
        </p>
        {block.scope ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            <RefreshCw size={10} aria-hidden />
            {block.scope === "all" ? "All sessions" : "Today only"}
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-t border-border px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-muted-foreground line-through">
            {block.from.name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {block.from.sets} × {block.from.reps}
          </p>
          <span className="mt-1 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {block.from.equipment}
          </span>
        </div>
        <ArrowRight
          size={14}
          className="shrink-0 text-muted-foreground"
          aria-hidden
        />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">
            {block.to.name}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {block.to.sets} × {block.to.reps}
          </p>
          <span className="mt-1 inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            {block.to.equipment}
          </span>
        </div>
      </div>
      {block.reason ? (
        <div className="border-t border-border px-4 py-2.5">
          <p className="text-xs text-muted-foreground">{block.reason}</p>
        </div>
      ) : null}
    </motion.div>
  );
}
