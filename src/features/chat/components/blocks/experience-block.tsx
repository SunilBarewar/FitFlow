"use client";

import { motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  EXPERIENCE_OPTIONS,
  type ExperienceOption,
} from "@/features/chat/setup-options";
import { cn } from "@/lib/utils/cn";
import {
  BlockAction,
  BlockCard,
  BlockHeader,
  Indicator,
  type Tone,
} from "../ui/controls";
import { ArrowMark, HistoryMark, InfoMark } from "../ui/glyphs";

/* Each level gets its own scene and its own tint, and the row borrows
   that tint for its tags and its chosen state. The artwork is sized by
   height inside a fixed-width column, so the three scenes keep their
   own proportions while every title still starts on the same line. */
const LEVEL_ART: Record<
  string,
  { src: string; width: number; height: number; tone: Tone }
> = {
  new: {
    src: "/assets/new-to-working-out.png",
    width: 148,
    height: 126,
    tone: "peach",
  },
  returning: {
    src: "/assets/worked-out-before.png",
    width: 148,
    height: 130,
    tone: "mint",
  },
  regular: {
    src: "/assets/works-out-consistently.png",
    width: 192,
    height: 126,
    tone: "sky",
  },
};

const CHOSEN = {
  accent: "border-accent-edge/55 bg-accent-soft/30",
  peach: "border-peach-ink/45 bg-peach-tint",
  mint: "border-mint-ink/45 bg-mint-tint",
  sky: "border-sky-ink/45 bg-sky-tint",
  violet: "border-violet-ink/45 bg-violet-tint",
} as const;

/* Tags sit on the row, so when the row is already tinted they step up
   one shade to stay legible against it. */
const TAG_REST = {
  accent: "bg-accent-soft/50 text-accent-edge",
  peach: "bg-peach-tint text-peach-ink",
  mint: "bg-mint-tint text-mint-ink",
  sky: "bg-sky-tint text-sky-ink",
  violet: "bg-violet-tint text-violet-ink",
} as const;

const TAG_CHOSEN = {
  accent: "bg-accent-soft text-accent-edge",
  peach: "bg-peach-edge text-peach-ink",
  mint: "bg-mint-edge text-mint-ink",
  sky: "bg-sky-edge text-sky-ink",
  violet: "bg-violet-edge text-violet-ink",
} as const;

function LevelRow({
  option,
  selected,
  dimmed,
  disabled,
  onSelect,
}: {
  option: ExperienceOption;
  selected: boolean;
  dimmed?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const art = LEVEL_ART[option.id];
  const tone = art?.tone ?? "accent";

  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      whileTap={disabled || reduceMotion ? undefined : { scale: 0.99 }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-2xl border p-2 text-left transition-colors @[26rem]:gap-3.5 @[26rem]:p-3",
        selected ? CHOSEN[tone] : "border-line bg-surface hover:bg-sunken",
        dimmed && "opacity-45",
        disabled ? "cursor-default" : "cursor-pointer",
      )}
    >
      {art ? (
        <span className="flex w-[54px] shrink-0 items-center justify-center @[26rem]:w-[112px]">
          <Image
            src={art.src}
            alt=""
            width={art.width}
            height={art.height}
            className="h-[40px] w-auto @[26rem]:h-[72px]"
          />
        </span>
      ) : null}

      <span className="min-w-0 flex-1">
        <span className="block text-[14px] leading-snug font-semibold text-ink @[26rem]:text-[15px]">
          {option.label}
        </span>
        <span className="block pt-0.5 text-[12.5px] leading-snug text-ink-muted @[26rem]:text-[13px]">
          {option.description}
        </span>
        {/* On a phone the row is only wide enough for one piece of prose.
            The description is the one that tells the levels apart, so the
            tags drop out until there's room for them to sit on one or two
            lines instead of three. */}
        <span className="hidden flex-wrap gap-1.5 pt-2 @[26rem]:flex">
          {option.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "inline-flex rounded-full px-2.5 py-1 text-[12px] leading-none font-medium transition-colors",
                selected ? TAG_CHOSEN[tone] : TAG_REST[tone],
              )}
            >
              {tag}
            </span>
          ))}
        </span>
      </span>

      <Indicator selected={selected} shape="circle" tone={tone} />
    </motion.button>
  );
}

export function ExperienceBlock({
  blockId: _blockId,
  resolved,
  initialSelectedId,
  onSubmit,
  onPersistSubmit,
}: {
  blockId: string;
  resolved: boolean;
  initialSelectedId?: string;
  onSubmit: (optionId: string, label: string) => void;
  onPersistSubmit?: (optionId: string) => void;
}) {
  const [selected, setSelected] = useState<string | null>(
    initialSelectedId ?? null,
  );
  const [submitted, setSubmitted] = useState<string | null>(
    resolved && initialSelectedId ? initialSelectedId : null,
  );
  const sent = useRef(false);
  const active = submitted ?? selected;
  const known = submitted !== null;

  return (
    <BlockCard className="@container">
      <BlockHeader
        glyph={<HistoryMark level="regular" size={18} />}
        title="How's your training been lately?"
        subtitle="Choose the option that best describes your current experience."
        status={resolved ? "Saved" : undefined}
      />

      <div className="flex flex-col gap-2 px-3 @[26rem]:px-4 pb-4" role="radiogroup">
        {EXPERIENCE_OPTIONS.map((option) => (
          <LevelRow
            key={option.id}
            option={option}
            selected={active === option.id}
            dimmed={known && active !== option.id}
            disabled={resolved}
            onSelect={() => {
              if (resolved) return;
              setSelected(option.id);
            }}
          />
        ))}
      </div>

      {resolved ? null : (
        <BlockAction
          label="Continue"
          glyph={<ArrowMark size={15} />}
          hintGlyph={<InfoMark size={14} />}
          hint="You can change this anytime in your settings."
          disabled={active === null}
          onClick={() => {
            const option = EXPERIENCE_OPTIONS.find(
              (item) => item.id === active,
            );
            if (sent.current || !option) return;
            sent.current = true;
            setSubmitted(option.id);
            onSubmit(option.id, option.label);
            onPersistSubmit?.(option.id);
          }}
        />
      )}
    </BlockCard>
  );
}
