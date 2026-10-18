"use client";

import { cn } from "cn";
import { useRef, useState } from "react";
import {
  activeBodyRegions,
  MUSCLE_PRESETS,
  MUSCLES,
  muscleReply,
  sameIdSet,
} from "@/features/chat/setup-options";
import { BodyFigure } from "./body-figure";
import {
  ContinueButton,
  DisclosureSwitch,
  SelectableChip,
  SetupCard,
} from "./setup-controls";

export function MuscleFocusBlock({
  blockId,
  resolved,
  onSubmit,
}: {
  blockId: string;
  resolved: boolean;
  onSubmit: (label: string) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [submitted, setSubmitted] = useState<string[] | null>(null);
  const sent = useRef(false);
  const active = submitted ?? selected;
  const known = submitted !== null;
  const presetId =
    MUSCLE_PRESETS.find((preset) => sameIdSet(preset.muscles, active))?.id ??
    null;

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
      <div className="flex items-start gap-3">
        <fieldset className="min-w-0 flex-1">
          <legend className="sr-only">What do you want to train?</legend>
          <div className="flex flex-col gap-2">
            {MUSCLE_PRESETS.map((preset) => {
              const isSelected = presetId === preset.id;
              const dimmed = known && presetId !== null && !isSelected;
              return (
                <label
                  key={preset.id}
                  className={cn(
                    "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 transition-colors duration-150",
                    "has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50",
                    isSelected
                      ? "border-primary bg-brand-green-light/70"
                      : "border-border bg-background hover:bg-muted",
                    dimmed && "opacity-40",
                    resolved && "cursor-default",
                  )}
                >
                  <input
                    type="radio"
                    name={`muscle-focus-${blockId}`}
                    value={preset.id}
                    checked={isSelected}
                    disabled={resolved}
                    onChange={() => selectPreset(preset.muscles)}
                    className="sr-only"
                  />
                  <RadioMark selected={isSelected} />
                  <span className="text-sm font-medium">{preset.label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <BodyFigure regions={activeBodyRegions(active)} />
      </div>

      <div className="mt-3">
        <DisclosureSwitch
          id={`muscle-parts-${blockId}`}
          checked={showAll}
          disabled={resolved}
          label="Show all body parts"
          hint="for full control"
          onChange={setShowAll}
        />
      </div>

      {showAll ? (
        <div className="flex flex-wrap gap-2 pt-3">
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
      ) : null}

      {resolved ? null : (
        <div className="mt-3">
          {active.length === 0 ? (
            <p className="mb-2 text-sm text-muted-foreground">
              Choose what you want to train.
            </p>
          ) : null}
          <ContinueButton
            disabled={active.length === 0}
            onClick={() => {
              if (sent.current || active.length === 0) return;
              sent.current = true;
              setSubmitted(active);
              onSubmit(muscleReply(active));
            }}
          />
        </div>
      )}
    </SetupCard>
  );
}

function RadioMark({ selected }: { selected: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
        selected ? "border-primary" : "border-muted-foreground/40",
      )}
    >
      {selected ? <span className="size-2.5 rounded-full bg-primary" /> : null}
    </span>
  );
}
