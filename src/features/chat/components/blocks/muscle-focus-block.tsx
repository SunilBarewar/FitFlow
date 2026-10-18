"use client";

import {
  BicepsFlexed,
  Footprints,
  type LucideIcon,
  PersonStanding,
} from "lucide-react";
import { useRef, useState } from "react";
import {
  MUSCLE_PRESETS,
  MUSCLES,
  muscleReply,
  sameIdSet,
} from "@/features/chat/setup-options";
import {
  PresetOption,
  SelectableChip,
  SetupAccordion,
  SetupCard,
  SetupCardHeader,
  SetupFooter,
  SetupSectionLabel,
} from "./setup-controls";

/**
 * Display copy for the quick picks. Kept separate from MUSCLE_PRESETS:
 * those labels are the exact phrases sent back to the coach, while
 * these titles/descriptions only need to help the user choose.
 */
const PRESET_META: Record<
  string,
  { title: string; description: string; icon: LucideIcon; surface: string }
> = {
  full: {
    title: "Full body",
    description: "A bit of everything, spread across your sessions.",
    icon: PersonStanding,
    surface: "bg-brand-green-light text-primary",
  },
  upper: {
    title: "Upper body",
    description: "Chest, back, shoulders and arms.",
    icon: BicepsFlexed,
    surface: "bg-brand-coral-light text-accent",
  },
  lower: {
    title: "Lower body",
    description: "Glutes, quads, hamstrings and calves.",
    icon: Footprints,
    surface: "bg-brand-sky-light text-info",
  },
};

export function MuscleFocusBlock({
  blockId,
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
  // A restored/custom selection isn't explained by the presets above,
  // so start with the accordion open to show exactly what was picked.
  const startsCustom =
    (initialSelected?.length ?? 0) > 0 &&
    !MUSCLE_PRESETS.some((preset) =>
      sameIdSet(preset.muscles, initialSelected ?? []),
    );

  function selectPreset(muscles: string[]) {
    if (resolved) return;
    setSelected(muscles);
  }

  function toggleMuscle(id: string) {
    if (resolved) return;
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }
  
  return (
    <SetupCard>
      <SetupCardHeader
        icon={BicepsFlexed}
        title="What do you want to train?"
        subtitle="Pick a focus and we'll shape your sessions around it, balanced across the week."
        status={
          resolved
            ? "Saved"
            : active.length > 0
              ? `${active.length} picked`
              : undefined
        }
      />

      <SetupSectionLabel>Quick picks — choose one</SetupSectionLabel>
      <div role="radiogroup" aria-label="What do you want to train?">
        <div className="flex flex-col gap-2">
          {MUSCLE_PRESETS.map((preset) => {
            const meta = PRESET_META[preset.id];
            const isSelected = presetId === preset.id;
            if (!meta) return null;
            return (
              <PresetOption
                key={preset.id}
                name={`muscle-focus-${blockId}`}
                title={meta.title}
                description={meta.description}
                icon={meta.icon}
                iconSurface={meta.surface}
                selected={isSelected}
                dimmed={known && presetId !== null && !isSelected}
                disabled={resolved}
                onSelect={() => selectPreset(preset.muscles)}
              />
            );
          })}
        </div>
      </div>

      <SetupAccordion
        label="Choose specific muscles"
        summary={
          active.length === 0
            ? "Biceps, chest, glutes and more"
            : `${active.length} of ${MUSCLES.length} selected`
        }
        defaultOpen={startsCustom}
      >
        <p className="mb-3 text-sm leading-snug text-muted-foreground">
          Want something more targeted? Tap every muscle you&apos;d like to
          include and we&apos;ll build around your list.
        </p>
        <div className="flex flex-wrap gap-2">
          {MUSCLES.map((muscle) => {
            const isSelected = active.includes(muscle.id);
            return (
              <SelectableChip
                key={muscle.id}
                label={muscle.label}
                selected={isSelected}
                dimmed={known && !isSelected}
                disabled={resolved}
                onClick={() => toggleMuscle(muscle.id)}
              />
            );
          })}
        </div>
      </SetupAccordion>

      {resolved ? null : (
        <SetupFooter
          message={
            active.length === 0
              ? "Choose a quick pick, or tap out your own list below."
              : presetId !== null
                ? "Good to go — this focus shapes your whole plan."
                : `${active.length} of ${MUSCLES.length} muscles picked — we'll train exactly these.`
          }
          disabled={active.length === 0}
          onContinue={() => {
            if (sent.current || active.length === 0) return;
            sent.current = true;
            setSubmitted(active);
            onSubmit(muscleReply(active));
            onPersistSubmit?.(active);
          }}
        />
      )}
    </SetupCard>
  );
}
