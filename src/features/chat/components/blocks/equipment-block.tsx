"use client";

import { Dumbbell, House, SlidersHorizontal, Warehouse } from "lucide-react";
import { useRef, useState } from "react";
import {
  EQUIPMENT,
  equipmentReply,
  GYM_EQUIPMENT,
  HOME_EQUIPMENT,
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

const PRESETS = [
  {
    id: "gym",
    label: "At a gym",
    description: "Machines, cables, barbells — the full range of kit.",
    equipment: GYM_EQUIPMENT,
    icon: Warehouse,
    tone: "mint",
  },
  {
    id: "home",
    label: "At home, no gear",
    description: "Bodyweight only. Nothing to buy, nothing to set up.",
    equipment: HOME_EQUIPMENT,
    icon: House,
    tone: "sky",
  },
] as const;

export function EquipmentBlock({
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
  const matchesPreset = PRESETS.some((preset) =>
    sameIdSet(active, preset.equipment),
  );
  const startsCustom =
    (initialSelected?.length ?? 0) > 0 &&
    !PRESETS.some((preset) =>
      sameIdSet(initialSelected ?? [], preset.equipment),
    );

  return (
    <BlockCard>
      <BlockHeader
        icon={Dumbbell}
        title="Where will you train?"
        subtitle="We'll only suggest exercises you can actually do."
        status={
          resolved
            ? "Saved"
            : active.length > 0
              ? `${active.length} picked`
              : undefined
        }
      />

      <div className="flex flex-col gap-2 px-4" role="radiogroup">
        {PRESETS.map((preset) => {
          const isSelected = sameIdSet(active, preset.equipment);
          return (
            <OptionRow
              key={preset.id}
              role="radio"
              title={preset.label}
              description={preset.description}
              icon={preset.icon}
              tone={preset.tone}
              selected={isSelected}
              dimmed={known && matchesPreset && !isSelected}
              disabled={resolved}
              onSelect={() => {
                if (resolved) return;
                setSelected([...preset.equipment]);
              }}
            />
          );
        })}
      </div>

      <div className="p-4 pt-3">
        <Disclosure
          icon={SlidersHorizontal}
          label="Choose specific equipment"
          summary={
            active.length === 0
              ? "Bands, cables, machines and more"
              : `${active.length} of ${EQUIPMENT.length} selected`
          }
          defaultOpen={startsCustom}
        >
          <p className="pb-3 text-[13px] leading-snug text-ink-muted">
            Train somewhere in between? Tap everything you can use.
          </p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map((item) => {
              const isSelected = active.includes(item.id);
              return (
                <ToggleChip
                  key={item.id}
                  label={item.label}
                  selected={isSelected}
                  dimmed={known && !isSelected}
                  disabled={resolved}
                  onToggle={() => {
                    if (resolved) return;
                    setSelected((current) =>
                      current.includes(item.id)
                        ? current.filter((value) => value !== item.id)
                        : [...current, item.id],
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
              ? "Choose a quick pick, or tap out your own kit list."
              : matchesPreset
                ? "This sets every exercise in your plan."
                : `${active.length} of ${EQUIPMENT.length} items picked.`
          }
          disabled={active.length === 0}
          onClick={() => {
            if (sent.current || active.length === 0) return;
            sent.current = true;
            setSubmitted(active);
            onSubmit(equipmentReply(active));
            onPersistSubmit?.(active);
          }}
        />
      )}
    </BlockCard>
  );
}
