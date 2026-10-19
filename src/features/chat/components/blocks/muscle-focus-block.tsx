"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  MUSCLE_PRESETS,
  MUSCLES,
  muscleReply,
  sameIdSet,
} from "@/features/chat/setup-options";
import { cn } from "@/lib/utils/cn";
import {
  BlockAction,
  BlockCard,
  BlockHeader,
  Disclosure,
  Indicator,
  ToggleChip,
} from "../ui/controls";
import { ArrowMark, FlexMark, InfoMark, KitMark } from "../ui/glyphs";

/**
 * Display copy for the quick picks. Kept separate from MUSCLE_PRESETS:
 * those labels are the exact phrases sent back to the coach, while
 * these titles only need to help the user choose.
 */
const PRESET_META: Record<
  string,
  { title: string; description: string; figure: string }
> = {
  full: {
    title: "Full body",
    description: "A mix of upper, lower and core in each session.",
    figure: "/assets/full-body.png",
  },
  upper: {
    title: "Upper body",
    description: "Chest, back, shoulders and arms.",
    figure: "/assets/upper-body.png",
  },
  lower: {
    title: "Lower body",
    description: "Glutes, quads, hamstrings and calves.",
    figure: "/assets/lower-body.png",
  },
};

/** One quick pick: the figure is the answer, the words only confirm it. */
function FocusCard({
  title,
  description,
  figure,
  selected,
  dimmed,
  disabled,
  onSelect,
}: {
  title: string;
  description: string;
  figure: string;
  selected: boolean;
  dimmed?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={title}
      disabled={disabled}
      onClick={onSelect}
      whileTap={disabled || reduceMotion ? undefined : { scale: 0.985 }}
      className={cn(
        "relative flex flex-col items-center rounded-2xl border p-2 pt-3 text-center transition-colors @[26rem]:p-3",
        selected
          ? "border-accent-edge/55 bg-accent-soft/30"
          : "border-line bg-surface hover:bg-sunken",
        dimmed && "opacity-45",
        disabled ? "cursor-default" : "cursor-pointer",
      )}
    >
      <span className="absolute top-2.5 right-2.5">
        <Indicator selected={selected} shape="circle" />
      </span>
      {/* Sized by height, not width: the three renders differ by a few
          pixels across, so matching heights is what keeps the bodies at
          one scale from card to card. */}
      <Image
        src={figure}
        alt=""
        width={197}
        height={334}
        className="h-[100px] w-auto pt-2 pb-2.5 @[26rem]:h-[180px] @[26rem]:pt-3"
      />
      <span className="block text-[13px] leading-snug font-semibold text-balance text-ink @[26rem]:text-[14px]">
        {title}
      </span>
      {/* Three columns in a chat bubble get narrow; below that the
          figure and the title carry the choice on their own. */}
      <span className="hidden pt-0.5 text-[12.5px] leading-snug text-balance text-ink-muted @[26rem]:block">
        {description}
      </span>
    </motion.button>
  );
}

export function MuscleFocusBlock({
  blockId: _blockId,
  resolved,
  initialSelected,
  onSubmit,
  onPersistSubmit,
}: {
  blockId: string;
  resolved: boolean;
  initialSelected?: string[];
  onSubmit: (label: string) => void;
  onPersistSubmit?: (selection: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(initialSelected ?? []);
  const [submitted, setSubmitted] = useState<string[] | null>(
    resolved && initialSelected ? initialSelected : null,
  );
  const sent = useRef(false);
  const active = submitted ?? selected;
  const known = submitted !== null;
  const presetId =
    MUSCLE_PRESETS.find((preset) => sameIdSet(preset.muscles, active))?.id ??
    null;
  const startsCustom =
    (initialSelected?.length ?? 0) > 0 &&
    !MUSCLE_PRESETS.some((preset) =>
      sameIdSet(preset.muscles, initialSelected ?? []),
    );

  return (
    <BlockCard className="@container">
      <BlockHeader
        glyph={<KitMark id="dumbbell" size={18} />}
        title="What do you want to train?"
        subtitle="Pick a focus and we'll balance it across your week."
        status={
          resolved
            ? "Saved"
            : active.length > 0
              ? `${active.length} picked`
              : undefined
        }
      />

      <div
        className="grid grid-cols-3 gap-2 px-3 @[26rem]:gap-2.5 @[26rem]:px-4"
        role="radiogroup"
      >
        {MUSCLE_PRESETS.map((preset) => {
          const meta = PRESET_META[preset.id];
          if (!meta) return null;
          const isSelected = presetId === preset.id;
          return (
            <FocusCard
              key={preset.id}
              title={meta.title}
              description={meta.description}
              figure={meta.figure}
              selected={isSelected}
              dimmed={known && presetId !== null && !isSelected}
              disabled={resolved}
              onSelect={() => {
                if (resolved) return;
                setSelected(preset.muscles);
              }}
            />
          );
        })}
      </div>

      <div className="p-3 pt-3 @[26rem]:p-4">
        <Disclosure
          label={
            <>
              Choose specific muscles{" "}
              <span className="font-normal text-ink-muted">(optional)</span>
            </>
          }
          glyph={<FlexMark size={17} />}
          glyphTone="accent"
          summary={
            active.length === 0
              ? "Biceps, chest, glutes and more"
              : `${active.length} of ${MUSCLES.length} selected`
          }
          defaultOpen={startsCustom}
        >
          <p className="pb-2.5 text-[13px] leading-snug text-ink-muted">
            Tap every muscle you&apos;d like to include.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {MUSCLES.map((muscle) => {
              const isSelected = active.includes(muscle.id);
              return (
                <ToggleChip
                  key={muscle.id}
                  label={muscle.label}
                  selected={isSelected}
                  dimmed={known && !isSelected}
                  disabled={resolved}
                  onToggle={() => {
                    if (resolved) return;
                    setSelected((current) =>
                      current.includes(muscle.id)
                        ? current.filter((value) => value !== muscle.id)
                        : [...current, muscle.id],
                    );
                  }}
                />
              );
            })}
          </div>
        </Disclosure>
      </div>

      {resolved ? null : (
        <BlockAction
          label="Continue"
          glyph={<ArrowMark size={15} />}
          hintGlyph={<InfoMark size={14} />}
          hint={
            active.length === 0
              ? "Choose a quick pick, or tap out your own list."
              : presetId !== null
                ? "You can change this anytime in your settings."
                : `${active.length} of ${MUSCLES.length} muscles picked.`
          }
          disabled={active.length === 0}
          onClick={() => {
            if (sent.current || active.length === 0) return;
            sent.current = true;
            setSubmitted(active);
            onSubmit(muscleReply(active));
            onPersistSubmit?.(active);
          }}
        />
      )}
    </BlockCard>
  );
}
