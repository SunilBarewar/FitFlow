"use client";

import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock,
  RefreshCw,
  Repeat2,
  Sparkles,
  Timer,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { ChatBlock } from "@/features/chat/types";
import { cn } from "@/lib/utils/cn";
import {
  BlockCard,
  BlockHeader,
  Indicator,
  SecondaryAction,
} from "../ui/controls";

type PlanCreatedBlock = Extract<ChatBlock, { type: "plan_created" }>;
type SessionMutationBlock = Extract<ChatBlock, { type: "session_mutation" }>;
type ExerciseOptionsBlock = Extract<ChatBlock, { type: "exercise_options" }>;
type ExerciseSwapBlock = Extract<ChatBlock, { type: "exercise_swap" }>;

export function PlanCreatedCard({
  block,
  onViewPlan,
}: {
  block: PlanCreatedBlock;
  onViewPlan: () => void;
}) {
  const { plan } = block;
  const trainingDays = plan.days.filter(
    (day) => day.exercises.length > 0,
  ).length;

  return (
    <BlockCard className="max-w-sm">
      <BlockHeader
        icon={Sparkles}
        title={plan.name}
        subtitle="Your week is ready — here's the shape of it."
        tone="mint"
      />

      <div className="grid grid-cols-3 divide-x divide-line border-y border-line">
        {[
          { icon: CalendarDays, value: `${plan.daysPerWeek}`, label: "days" },
          { icon: Clock, value: `${plan.minutesPerSession}`, label: "min" },
          { icon: Repeat2, value: `${trainingDays}`, label: "sessions" },
        ].map((fact) => (
          <div
            key={fact.label}
            className="flex flex-col items-center gap-0.5 py-3"
          >
            <fact.icon size={14} className="text-ink-subtle" aria-hidden />
            <span className="font-brand-mono text-[17px] leading-none text-ink">
              {fact.value}
            </span>
            <span className="text-[11px] text-ink-muted">{fact.label}</span>
          </div>
        ))}
      </div>

      <div className="p-3">
        <motion.button
          type="button"
          onClick={onViewPlan}
          whileTap={{ scale: 0.98 }}
          className="group flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-[14px] font-semibold text-white transition-colors hover:bg-ink-soft"
        >
          See your plan
          <ArrowRight
            size={15}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </motion.button>
      </div>
    </BlockCard>
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
    <BlockCard className="max-w-md">
      <BlockHeader
        icon={Timer}
        title="Today, adjusted"
        subtitle="Your weekly plan stays exactly as it is."
      />

      <dl className="flex flex-col gap-2 border-t border-line p-4">
        <ChangeRow
          label="Duration"
          from={`${block.fromMinutes} min`}
          to={`${block.toMinutes} min`}
        />
        <ChangeRow
          label="Equipment"
          from={block.fromEquipment}
          to={block.toEquipment}
        />
        <ChangeRow
          label="Intensity"
          from={block.fromIntensity}
          to={block.toIntensity}
        />
      </dl>

      {resolved ? (
        <p className="flex items-center gap-1.5 border-t border-line px-4 py-3 text-[13px] font-semibold text-mint-ink">
          <Check size={14} strokeWidth={3} aria-hidden /> Applied to today
        </p>
      ) : (
        <div className="flex gap-2 border-t border-line p-3">
          <SecondaryAction label="Keep original" onClick={onKeep} />
          <motion.button
            type="button"
            onClick={onStart}
            whileTap={{ scale: 0.97 }}
            className="h-10 flex-1 rounded-full bg-ink text-[13px] font-semibold text-white transition-colors hover:bg-ink-soft"
          >
            Start adjusted
          </motion.button>
        </div>
      )}
    </BlockCard>
  );
}

function ChangeRow({
  label,
  from,
  to,
}: {
  label: string;
  from: string;
  to: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="flex min-w-0 items-center gap-2">
        <span className="truncate text-ink-subtle line-through">{from}</span>
        <ArrowRight
          size={12}
          className="shrink-0 text-ink-subtle"
          aria-hidden
        />
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="truncate rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-ink"
        >
          {to}
        </motion.span>
      </dd>
    </div>
  );
}

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
  const chosen = block.options.find(
    (option) => option.exerciseId === selectedId,
  );
  const shown = resolved && chosen ? [chosen] : block.options;

  return (
    <BlockCard className="max-w-md">
      <div className="p-4 pb-3">
        <p className="font-brand-mono text-[11px] tracking-wide text-ink-subtle uppercase">
          {block.sessionLabel}
        </p>
        <p className="pt-1 text-[15px] font-semibold tracking-[-0.01em]">
          Instead of{" "}
          <span className="text-ink-subtle line-through">
            {block.replacing.name}
          </span>
        </p>
      </div>

      <ul className="divide-y divide-line border-t border-line">
        {shown.map((option, index) => {
          const isSelected = option.exerciseId === selectedId;
          const decided = resolved || selectedId !== null;
          return (
            <motion.li
              key={option.exerciseId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                isSelected && "bg-accent-soft/30",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] leading-tight font-semibold">
                  {option.name}
                </p>
                <p className="truncate pt-1 text-[12px] text-ink-muted">
                  {option.sets} × {option.reps} · {option.equipment}
                </p>
                {option.primaryMuscles.length > 0 ? (
                  <p className="truncate pt-0.5 text-[12px] text-ink-subtle">
                    {option.primaryMuscles.slice(0, 2).join(", ")}
                  </p>
                ) : null}
              </div>

              {decided ? (
                isSelected ? (
                  <Indicator selected />
                ) : null
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedId(option.exerciseId);
                    onPersistSubmit(option.exerciseId);
                    onSelect(option.exerciseId, option.name);
                  }}
                  className="h-9 shrink-0 rounded-full bg-ink px-3.5 text-[12px] font-semibold text-white transition-colors hover:bg-ink-soft"
                >
                  Use this
                </motion.button>
              )}
            </motion.li>
          );
        })}
      </ul>
    </BlockCard>
  );
}

export function ExerciseSwapBlock({ block }: { block: ExerciseSwapBlock }) {
  return (
    <BlockCard className="max-w-md">
      <div className="flex items-center justify-between gap-3 p-4 pb-3">
        <p className="font-brand-mono text-[11px] tracking-wide text-ink-subtle uppercase">
          {block.sessionLabel}
        </p>
        {block.scope ? (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sunken px-2.5 py-1 text-[11px] font-medium text-ink-muted">
            <RefreshCw size={10} aria-hidden />
            {block.scope === "all" ? "All sessions" : "Today only"}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-t border-line p-4">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-ink-subtle line-through">
            {block.from.name}
          </p>
          <p className="truncate pt-1 text-[12px] text-ink-subtle">
            {block.from.sets} × {block.from.reps} · {block.from.equipment}
          </p>
        </div>

        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-edge"
        >
          <ArrowRight size={14} aria-hidden />
        </motion.span>

        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ink">
            {block.to.name}
          </p>
          <p className="truncate pt-1 text-[12px] text-ink-muted">
            {block.to.sets} × {block.to.reps} · {block.to.equipment}
          </p>
        </div>
      </div>

      {block.reason ? (
        <p className="border-t border-line px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
          {block.reason}
        </p>
      ) : null}
    </BlockCard>
  );
}
