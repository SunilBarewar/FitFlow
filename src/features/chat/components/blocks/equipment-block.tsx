"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  EQUIPMENT,
  equipmentReply,
  GYM_EQUIPMENT,
  HOME_EQUIPMENT,
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
  type Tone,
} from "../ui/controls";
import { ArrowMark, GearMark, InfoMark, KitMark } from "../ui/glyphs";

/* Each place to train gets its own scene, and the card borrows that
   scene's colour for its chosen state — green for the gym, blue for
   the living room. */
const PRESETS: {
  id: string;
  label: string;
  description: string;
  equipment: readonly string[];
  figure: { src: string; width: number; height: number };
  tone: Tone;
}[] = [
  {
    id: "gym",
    label: "At a gym",
    description: "Machines, cables, barbells and more.",
    equipment: GYM_EQUIPMENT,
    figure: { src: "/assets/gym-illustration.png", width: 846, height: 515 },
    tone: "mint",
  },
  {
    id: "home",
    label: "At home, no gear",
    description: "Bodyweight only. Nothing to buy.",
    equipment: HOME_EQUIPMENT,
    figure: {
      src: "/assets/home-workout-illustration.png",
      width: 851,
      height: 466,
    },
    tone: "sky",
  },
];

/** One place to train, told by the picture before the words. */
function PlaceCard({
  label,
  description,
  figure,
  tone,
  selected,
  dimmed,
  disabled,
  onSelect,
}: {
  label: string;
  description: string;
  figure: { src: string; width: number; height: number };
  tone: Tone;
  selected: boolean;
  dimmed?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const chosen = {
    accent: "border-accent-edge/55 bg-accent-soft/30",
    peach: "border-peach-ink/45 bg-peach-tint",
    mint: "border-mint-ink/45 bg-mint-tint",
    sky: "border-sky-ink/45 bg-sky-tint",
    violet: "border-violet-ink/45 bg-violet-tint",
  } as const;

  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-label={label}
      disabled={disabled}
      onClick={onSelect}
      whileTap={disabled || reduceMotion ? undefined : { scale: 0.985 }}
      className={cn(
        "relative flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-colors @[26rem]:flex-col @[26rem]:gap-0 @[26rem]:p-3 @[26rem]:pb-4 @[26rem]:text-center",
        selected ? chosen[tone] : "border-line bg-surface hover:bg-sunken",
        dimmed && "opacity-45",
        disabled ? "cursor-default" : "cursor-pointer",
      )}
    >
      {/* On a phone the scene would fill the screen if it ran full-width,
          so the card turns into a row: picture left, words right. The
          pictorial card comes back as soon as there are two columns. */}
      <span className="flex w-[104px] shrink-0 items-center justify-center @[26rem]:w-full @[26rem]:pt-1 @[26rem]:pb-2">
        <Image
          src={figure.src}
          alt=""
          width={figure.width}
          height={figure.height}
          sizes="(max-width: 480px) 110px, 320px"
          className="h-[68px] w-auto object-contain @[26rem]:h-[180px] @[26rem]:w-full"
        />
      </span>
      <span className="min-w-0 flex-1 @[26rem]:flex-none">
        <span className="block text-[14px] leading-snug font-semibold text-balance text-ink @[26rem]:text-[15px]">
          {label}
        </span>
        <span className="block pt-0.5 text-[12.5px] leading-snug text-balance text-ink-muted @[26rem]:text-[13px]">
          {description}
        </span>
      </span>
      <span className="shrink-0 @[26rem]:absolute @[26rem]:top-2.5 @[26rem]:right-2.5">
        <Indicator selected={selected} shape="circle" tone={tone} />
      </span>
    </motion.button>
  );
}

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
    <BlockCard className="@container">
      <BlockHeader
        glyph={<KitMark id="dumbbell" size={18} />}
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

      <div
        className="grid grid-cols-1 gap-2.5 px-3 @[26rem]:grid-cols-2 @[26rem]:gap-3 @[26rem]:px-4"
        role="radiogroup"
      >
        {PRESETS.map((preset) => {
          const isSelected = sameIdSet(active, preset.equipment);
          return (
            <PlaceCard
              key={preset.id}
              label={preset.label}
              description={preset.description}
              figure={preset.figure}
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

      <div className="p-3 pt-3 @[26rem]:p-4">
        <Disclosure
          label={
            <>
              Choose specific equipment{" "}
              <span className="font-normal text-ink-muted">(optional)</span>
            </>
          }
          glyph={<GearMark size={17} />}
          glyphTone="accent"
          summary={
            active.length === 0
              ? "Bands, cables, machines and more"
              : `${active.length} of ${EQUIPMENT.length} selected`
          }
          defaultOpen={startsCustom}
        >
          <p className="pb-2.5 text-[13px] leading-snug text-ink-muted">
            Train somewhere in between? Tap everything you can use.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {EQUIPMENT.map((item) => {
              const isSelected = active.includes(item.id);
              return (
                <ToggleChip
                  key={item.id}
                  label={item.label}
                  glyph={<KitMark id={item.id} size={17} />}
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
          glyph={<ArrowMark size={15} />}
          hintGlyph={<InfoMark size={14} />}
          hint={
            active.length === 0
              ? "Choose a quick pick, or tap out your own kit list."
              : matchesPreset
                ? "You can change this anytime."
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
