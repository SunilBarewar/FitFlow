"use client";

import { Dumbbell, House, Warehouse } from "lucide-react";
import { useRef, useState } from "react";
import {
  EQUIPMENT,
  equipmentReply,
  GYM_EQUIPMENT,
  HOME_EQUIPMENT,
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

const PRESETS = [
  {
    id: "gym",
    label: "At a gym",
    description: "Machines, cables, barbells — the full range of kit.",
    equipment: GYM_EQUIPMENT,
    icon: Warehouse,
    surface: "bg-brand-green-light text-primary",
  },
  {
    id: "home",
    label: "At home, no gear",
    description: "Bodyweight only. Nothing to buy, nothing to set up.",
    equipment: HOME_EQUIPMENT,
    icon: House,
    surface: "bg-brand-sky-light text-brand-sky",
  },
] as const;

export function EquipmentBlock({
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
  const matchesPreset = PRESETS.some((preset) =>
    sameIdSet(active, preset.equipment),
  );
  // A restored/custom selection isn't explained by the presets above,
  // so start with the accordion open to show exactly what was picked.
  const startsCustom =
    (initialSelected?.length ?? 0) > 0 &&
    !PRESETS.some((preset) =>
      sameIdSet(initialSelected ?? [], preset.equipment),
    );

  function selectPreset(equipment: readonly string[]) {
    if (resolved) return;
    setSelected([...equipment]);
  }

  function toggleItem(id: string) {
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
        icon={Dumbbell}
        title="Where will you train?"
        subtitle="We'll only suggest exercises you can actually do with what's around you."
        status={
          resolved
            ? "Saved"
            : active.length > 0
              ? `${active.length} picked`
              : undefined
        }
      />

      <SetupSectionLabel>Quick picks — choose one</SetupSectionLabel>
      <div role="radiogroup" aria-label="Where will you work out?">
        <div className="flex flex-col gap-2">
          {PRESETS.map((preset) => {
            const isSelected = sameIdSet(active, preset.equipment);
            return (
              <PresetOption
                key={preset.id}
                name={`equipment-${blockId}`}
                title={preset.label}
                description={preset.description}
                icon={preset.icon}
                iconSurface={preset.surface}
                selected={isSelected}
                dimmed={known && matchesPreset && !isSelected}
                disabled={resolved}
                onSelect={() => selectPreset(preset.equipment)}
              />
            );
          })}
        </div>
      </div>

      <SetupAccordion
        label="Choose specific equipment"
        summary={
          active.length === 0
            ? "Bands, cables, machines and more"
            : `${active.length} of ${EQUIPMENT.length} selected`
        }
        defaultOpen={startsCustom}
      >
        <p className="mb-3 text-sm leading-snug text-muted-foreground">
          Train somewhere in between? Tap everything you can use and we&apos;ll
          build your sessions around exactly that.
        </p>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT.map((item) => {
            const isSelected = active.includes(item.id);
            return (
              <SelectableChip
                key={item.id}
                label={item.label}
                selected={isSelected}
                dimmed={known && !isSelected}
                disabled={resolved}
                onClick={() => toggleItem(item.id)}
              />
            );
          })}
        </div>
      </SetupAccordion>

      {resolved ? null : (
        <SetupFooter
          message={
            active.length === 0
              ? "Choose a quick pick, or tap out your own kit list below."
              : matchesPreset
                ? "Good to go — this sets every exercise in your plan."
                : `${active.length} of ${EQUIPMENT.length} items picked — we'll only use these.`
          }
          disabled={active.length === 0}
          onContinue={() => {
            if (sent.current || active.length === 0) return;
            sent.current = true;
            setSubmitted(active);
            onSubmit(equipmentReply(active));
            onPersistSubmit?.(active);
          }}
        />
      )}
    </SetupCard>
  );
}
