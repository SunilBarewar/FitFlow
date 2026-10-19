"use client";

import {
  BicepsFlexed,
  Footprints,
  type LucideIcon,
  PersonStanding,
  SlidersHorizontal,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  MUSCLE_PRESETS,
  MUSCLES,
  muscleReply,
  sameIdSet,
} from "@/features/chat/setup-options";
import {
  BlockAction,
  BlockCard,
  BlockHeader,
  Disclosure,
  OptionRow,
  ToggleChip,
} from "../ui/controls";

/**
 * Display copy for the quick picks. Kept separate from MUSCLE_PRESETS:
 * those labels are the exact phrases sent back to the coach, while
 * these titles/descriptions only need to help the user choose.
 */
const PRESET_META: Record<
  string,
  {
    title: string;
    description: string;
    icon: LucideIcon;
    tone: "accent" | "mint" | "sky" | "violet";
  }
> = {
  full: {
    title: "Full body",
    description: "A bit of everything, spread across your sessions.",
    icon: PersonStanding,
    tone: "mint",
  },
  upper: {
    title: "Upper body",
    description: "Chest, back, shoulders and arms.",
    icon: BicepsFlexed,
    tone: "accent",
  },
  lower: {
    title: "Lower body",
    description: "Glutes, quads, hamstrings and calves.",
    icon: Footprints,
    tone: "sky",
  },
};

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
  // A restored or custom selection isn't explained by the presets above,
  // so open the drawer to show exactly what was picked.
  const startsCustom =
    (initialSelected?.length ?? 0) > 0 &&
    !MUSCLE_PRESETS.some((preset) =>
      sameIdSet(preset.muscles, initialSelected ?? []),
    );

  return (
    <BlockCard>
      <BlockHeader
        icon={BicepsFlexed}
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

      <div className="flex flex-col gap-2 px-4" role="radiogroup">
        {MUSCLE_PRESETS.map((preset) => {
          const meta = PRESET_META[preset.id];
          if (!meta) return null;
          const isSelected = presetId === preset.id;
          return (
            <OptionRow
              key={preset.id}
              role="radio"
              title={meta.title}
              description={meta.description}
              icon={meta.icon}
              tone={meta.tone}
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

      <div className="p-4 pt-3">
        <Disclosure
          icon={SlidersHorizontal}
          label="Choose specific muscles"
          summary={
            active.length === 0
              ? "Biceps, chest, glutes and more"
              : `${active.length} of ${MUSCLES.length} selected`
          }
          defaultOpen={startsCustom}
        >
          <p className="pb-3 text-[13px] leading-snug text-ink-muted">
            Tap every muscle you&apos;d like to include and we&apos;ll build
            around your list.
          </p>
          <div className="flex flex-wrap gap-2">
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
          hint={
            active.length === 0
              ? "Choose a quick pick, or tap out your own list."
              : presetId !== null
                ? "This focus shapes your whole plan."
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
