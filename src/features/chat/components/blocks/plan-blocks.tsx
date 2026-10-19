"use client";

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
import {
  ArrowMark,
  KitMark,
  MinutesMark,
  SessionDelta,
  SwapMark,
  Tick,
  WeekRibbon,
} from "../ui/glyphs";

type PlanCreatedBlock = Extract<ChatBlock, { type: "plan_created" }>;
type SessionMutationBlock = Extract<ChatBlock, { type: "session_mutation" }>;
type ExerciseOptionsBlock = Extract<ChatBlock, { type: "exercise_options" }>;
type ExerciseSwapBlock = Extract<ChatBlock, { type: "exercise_swap" }>;

/* The plan arrives as a shape, not a list of stats: seven bars, one per
   day, tall where the work is and flat where the rest is. */
export function PlanCreatedCard({
  block,
  onViewPlan,
}: {
  block: PlanCreatedBlock;
  onViewPlan: () => void;
}) {
  const { plan } = block;
  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });
  const days = plan.days.map((day) => ({
    label: day.label,
    exercises: day.exercises.length,
  }));
  const trainingDays = days.filter((day) => day.exercises > 0).length;

  return (
    <BlockCard className="max-w-sm">
      <BlockHeader
        glyph={<MinutesMark minutes={plan.minutesPerSession} size={18} />}
        title={plan.name}
        subtitle={`${trainingDays} training days · ${plan.minutesPerSession} min a session`}
        tone="mint"
      />

      <div className="border-y border-line px-4 py-4">
        <WeekRibbon days={days} todayLabel={todayLabel} />
      </div>

      <div className="p-3">
        <motion.button
          type="button"
          onClick={onViewPlan}
          whileTap={{ scale: 0.98 }}
          className="group flex h-11 w-full items-center justify-center gap-2 rounded-full bg-ink text-[14px] font-semibold text-white transition-colors hover:bg-ink-soft"
        >
          See your plan
          <motion.span
            aria-hidden
            className="transition-transform group-hover:translate-x-0.5"
          >
            <ArrowMark size={15} />
          </motion.span>
        </motion.button>
      </div>
    </BlockCard>
  );
}

/* What changed today, measured against what it was. */
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
        glyph={<MinutesMark minutes={block.toMinutes} size={18} />}
        title="Today, adjusted"
        subtitle="Your weekly plan stays exactly as it is."
      />

      <div className="border-t border-line p-4">
        <SessionDelta
          fromMinutes={block.fromMinutes}
          toMinutes={block.toMinutes}
        />

        <dl className="flex flex-col gap-2 pt-4">
          <ChangeRow
            label="Equipment"
            from={block.fromEquipment}
            to={block.toEquipment}
            glyph={<KitMark id={block.toEquipment} size={15} />}
          />
          <ChangeRow
            label="Intensity"
            from={block.fromIntensity}
            to={block.toIntensity}
          />
        </dl>
      </div>

      {resolved ? (
        <p className="flex items-center gap-1.5 border-t border-line px-4 py-3 text-[13px] font-semibold text-mint-ink">
          <Tick size={14} /> Applied to today
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
  glyph,
}: {
  label: string;
  from: string;
  to: string;
  glyph?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-[13px]">
      <dt className="text-ink-muted">{label}</dt>
      <dd className="flex min-w-0 items-center gap-2">
        <span className="truncate text-ink-subtle line-through">{from}</span>
        <motion.span
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="flex min-w-0 items-center gap-1.5 rounded-full bg-accent-soft px-2 py-0.5 font-semibold text-ink"
        >
          {glyph ? <span className="text-accent-edge">{glyph}</span> : null}
          <span className="truncate">{to}</span>
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
              <span
                aria-hidden
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-sunken text-ink-muted"
              >
                <KitMark id={option.equipment} size={17} />
              </span>

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

/* One exercise handing over to another, drawn as a handover. */
export function ExerciseSwapBlock({ block }: { block: ExerciseSwapBlock }) {
  return (
    <BlockCard className="max-w-md">
      <div className="flex items-center justify-between gap-3 p-4 pb-3">
        <p className="font-brand-mono text-[11px] tracking-wide text-ink-subtle uppercase">
          {block.sessionLabel}
        </p>
        {block.scope ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-sunken px-2.5 py-1 text-[11px] font-medium text-ink-muted">
            <SwapMark size={12} />
            {block.scope === "all" ? "All sessions" : "Today only"}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 border-t border-line p-4">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-ink-subtle line-through">
            {block.from.name}
          </p>
          <p className="flex items-center gap-1.5 truncate pt-1 text-[12px] text-ink-subtle">
            <KitMark id={block.from.equipment} size={14} />
            {block.from.sets} × {block.from.reps}
          </p>
        </div>

        <motion.span
          aria-hidden
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent-edge"
        >
          <SwapMark size={16} />
        </motion.span>

        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ink">
            {block.to.name}
          </p>
          <p className="flex items-center gap-1.5 truncate pt-1 text-[12px] text-ink-muted">
            <KitMark id={block.to.equipment} size={14} />
            {block.to.sets} × {block.to.reps}
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
