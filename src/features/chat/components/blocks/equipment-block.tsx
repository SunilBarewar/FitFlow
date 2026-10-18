"use client";

import { cn } from "cn";
import { Dumbbell, House } from "lucide-react";
import { useRef, useState } from "react";
import {
  EQUIPMENT,
  equipmentReply,
  GYM_EQUIPMENT,
  HOME_EQUIPMENT,
  sameIdSet,
} from "@/features/chat/setup-options";
import {
  ContinueButton,
  DisclosureSwitch,
  SelectableChip,
  SetupCard,
} from "./setup-controls";

const PRESETS = [
  {
    id: "gym",
    label: "Gym access",
    description: "Use the full range of gym equipment and machines.",
    equipment: GYM_EQUIPMENT,
    icon: Dumbbell,
    surface: "bg-brand-green-light text-primary",
  },
  {
    id: "home",
    label: "Work out at home",
    description: "Start with workouts that need no equipment.",
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
  const [showSpecific, setShowSpecific] = useState(false);
  const [submitted, setSubmitted] = useState<string[] | null>(
    resolved && initialSelected ? initialSelected : null,
  );
  const sent = useRef(false);
  const active = submitted ?? selected;
  const known = submitted !== null;
  const matchesPreset = PRESETS.some((preset) =>
    sameIdSet(active, preset.equipment),
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
      <fieldset>
        <legend className="sr-only">Where will you work out?</legend>
        <div className="flex flex-col gap-2">
          {PRESETS.map((preset) => {
            const isSelected = sameIdSet(active, preset.equipment);
            const Icon = preset.icon;
            return (
              <label
                key={preset.id}
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition-colors duration-150",
                  "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                  isSelected
                    ? "border-primary bg-brand-green-light/70"
                    : "border-border bg-background hover:bg-muted",
                  known && matchesPreset && !isSelected && "opacity-40",
                  resolved && "cursor-default",
                )}
              >
                <input
                  type="radio"
                  name={`equipment-${blockId}`}
                  value={preset.id}
                  checked={isSelected}
                  disabled={resolved}
                  onChange={() => selectPreset(preset.equipment)}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-lg",
                    preset.surface,
                  )}
                >
                  <Icon size={18} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold leading-snug">
                    {preset.label}
                  </span>
                  <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
                    {preset.description}
                  </span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                    isSelected
                      ? "border-primary"
                      : "border-muted-foreground/40",
                  )}
                >
                  {isSelected ? (
                    <span className="size-2.5 rounded-full bg-primary" />
                  ) : null}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-3">
        <DisclosureSwitch
          id={`equipment-specific-${blockId}`}
          checked={showSpecific}
          disabled={resolved}
          label="Choose specific equipment"
          hint="for full control"
          onChange={setShowSpecific}
        />
      </div>

      {showSpecific ? (
        <div className="flex flex-wrap gap-2 pt-3">
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
      ) : null}

      {resolved ? null : (
        <div className="mt-3">
          {active.length === 0 ? (
            <p className="mb-2 text-sm text-muted-foreground">
              Choose where you'll train.
            </p>
          ) : null}
          <ContinueButton
            disabled={active.length === 0}
            onClick={() => {
              if (sent.current || active.length === 0) return;
              sent.current = true;
              setSubmitted(active);
              onSubmit(equipmentReply(active));
              onPersistSubmit?.(active);
            }}
          />
        </div>
      )}
    </SetupCard>
  );
}
