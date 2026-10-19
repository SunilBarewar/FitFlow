"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { Caret, Tick } from "./glyphs";

/* ─── Shared controls for everything the coach puts in the thread ───
   One vocabulary: a card, a row you choose, a chip you toggle, a
   drawer you open, and a sliding switch. Every one of them animates
   the same way, so the whole conversation feels like one object. */

const SPRING = { type: "spring", stiffness: 420, damping: 32 } as const;

/** The pastel a block tints itself with, usually taken from its artwork. */
export type Tone = "accent" | "peach" | "mint" | "sky" | "violet";

const TINTS = {
  accent: "bg-accent-soft text-accent-edge",
  peach: "bg-peach-tint text-peach-ink",
  mint: "bg-mint-tint text-mint-ink",
  sky: "bg-sky-tint text-sky-ink",
  violet: "bg-violet-tint text-violet-ink",
} as const;

/** The container every interactive coach block sits in. */
export function BlockCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.2, 0.7, 0.2, 1] }}
      className={cn(
        "w-full overflow-hidden rounded-[22px] border border-line bg-surface shadow-card",
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

/** Icon, question, one helper line, and the answer state on the right. */
export function BlockHeader({
  glyph,
  title,
  subtitle,
  status,
  tone = "accent",
}: {
  /** A drawn mark from ./glyphs — never a stock icon. */
  glyph: React.ReactNode;
  title: string;
  subtitle?: string;
  status?: string;
  tone?: Tone;
}) {
  return (
    <div className="flex items-start gap-3 p-4">
      <span
        aria-hidden
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          TINTS[tone],
        )}
      >
        {glyph}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-[15px] leading-snug font-semibold tracking-[-0.01em] text-ink">
          {title}
        </h3>
        {subtitle ? (
          <p className="pt-0.5 text-[13px] leading-snug text-pretty text-ink-muted">
            {subtitle}
          </p>
        ) : null}
      </div>
      <AnimatePresence>
        {status ? (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={SPRING}
            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sunken px-2.5 py-1 font-brand-mono text-[11px] text-ink-muted"
          >
            {status}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** A full-width answer: tap it and it is sent. */
export function OptionRow({
  title,
  description,
  glyph,
  tone = "accent",
  selected,
  dimmed,
  disabled,
  onSelect,
  role = "button",
}: {
  title: string;
  description?: string;
  glyph?: React.ReactNode;
  tone?: Tone;
  selected: boolean;
  dimmed?: boolean;
  disabled?: boolean;
  onSelect: () => void;
  role?: "button" | "radio";
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      role={role}
      aria-checked={role === "radio" ? selected : undefined}
      disabled={disabled}
      onClick={onSelect}
      whileTap={disabled || reduceMotion ? undefined : { scale: 0.99 }}
      className={cn(
        "flex min-h-14 w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-colors",
        selected
          ? "border-accent-edge/50 bg-accent-soft/35"
          : "border-line bg-surface hover:bg-sunken",
        dimmed && "opacity-45",
        disabled ? "cursor-default" : "cursor-pointer",
      )}
    >
      {glyph ? (
        <span
          aria-hidden
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl",
            TINTS[tone],
          )}
        >
          {glyph}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] leading-snug font-semibold text-ink">
          {title}
        </span>
        {description ? (
          <span className="block pt-0.5 text-[13px] leading-snug text-ink-muted">
            {description}
          </span>
        ) : null}
      </span>
      <Indicator selected={selected} shape="circle" />
    </motion.button>
  );
}

/** The tick that confirms a choice — the one animation used everywhere. */
export function Indicator({
  selected,
  shape = "circle",
  tone = "accent",
}: {
  selected: boolean;
  shape?: "circle" | "square";
  tone?: Tone;
}) {
  const marks = {
    accent: "border-accent-edge bg-accent-edge",
    peach: "border-peach-ink bg-peach-ink",
    mint: "border-mint-ink bg-mint-ink",
    sky: "border-sky-ink bg-sky-ink",
    violet: "border-violet-ink bg-violet-ink",
  } as const;

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-5 shrink-0 items-center justify-center border-2 transition-colors duration-150",
        shape === "circle" ? "rounded-full" : "rounded-md",
        selected
          ? `${marks[tone]} text-white`
          : "border-line-strong text-transparent",
      )}
    >
      <AnimatePresence initial={false}>
        {selected ? (
          <motion.span
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={SPRING}
          >
            <Tick size={12} />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

/** A chip you can switch on and off. With a glyph, the mark itself
 *  flips to a tick when the chip is on — the switch is the drawing. */
export function ToggleChip({
  label,
  glyph,
  selected,
  dimmed,
  disabled,
  onToggle,
}: {
  label: string;
  glyph?: React.ReactNode;
  selected: boolean;
  dimmed?: boolean;
  disabled?: boolean;
  onToggle: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onToggle}
      whileTap={disabled || reduceMotion ? undefined : { scale: 0.95 }}
      className={cn(
        "inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-[13px] font-medium transition-colors",
        selected
          ? "border-accent-edge/50 bg-accent-soft text-ink"
          : "border-line bg-surface text-ink-soft hover:bg-sunken",
        dimmed && "opacity-45",
        disabled ? "cursor-default" : "cursor-pointer",
      )}
    >
      {glyph ? (
        <span className="relative flex size-5 items-center justify-center">
          <AnimatePresence initial={false} mode="wait">
            {selected ? (
              <motion.span
                key="on"
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={SPRING}
                className="flex size-5 items-center justify-center rounded-md bg-accent-edge text-white"
              >
                <Tick size={11} />
              </motion.span>
            ) : (
              <motion.span
                key="off"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ duration: 0.12 }}
                className="text-ink-subtle"
              >
                {glyph}
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      ) : (
        <Indicator selected={selected} shape="square" />
      )}
      {label}
    </motion.button>
  );
}

/** A real switch, for "either / or" that isn't a question in itself. */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full px-0.5 transition-colors",
        checked ? "bg-accent-edge" : "bg-line-strong",
        disabled && "opacity-50",
      )}
    >
      <motion.span
        layout
        transition={SPRING}
        className={cn(
          "block size-5 rounded-full bg-white shadow-card",
          checked && "ml-auto",
        )}
      />
    </button>
  );
}

/** Collapsed detail: the fast path stays on top, full control underneath. */
export function Disclosure({
  label,
  summary,
  glyph,
  glyphTone,
  defaultOpen = false,
  children,
}: {
  /** Rich, so a block can mute an "(optional)" suffix inside the label. */
  label: React.ReactNode;
  summary?: string;
  glyph?: React.ReactNode;
  /** Left unset the tile stays quiet; set, it picks up that tint. */
  glyphTone?: Tone;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const reduceMotion = useReducedMotion();
  const contentId = useId();

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border transition-colors",
        open ? "border-accent-edge/40 bg-sunken/50" : "border-line bg-surface",
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((value) => !value)}
        className="flex min-h-13 w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-sunken"
      >
        {glyph ? (
          <span
            aria-hidden
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg",
              glyphTone ? TINTS[glyphTone] : "bg-sunken text-ink-muted",
            )}
          >
            {glyph}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] leading-snug font-semibold text-ink">
            {label}
          </span>
          {summary ? (
            <span className="block truncate text-[12px] leading-snug text-ink-muted">
              {summary}
            </span>
          ) : null}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
          className="shrink-0 text-ink-subtle"
        >
          <Caret size={18} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={contentId}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-line p-3">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** The one primary action a block is allowed. */
export function BlockAction({
  label,
  hint,
  hintGlyph,
  glyph,
  disabled,
  onClick,
}: {
  label: string;
  hint?: string;
  /** A small mark in front of the hint, when the hint is an aside. */
  hintGlyph?: React.ReactNode;
  /** A mark after the label, for actions that go somewhere. */
  glyph?: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  /* The footer measures itself rather than the card, so every block gets
     the same behaviour wherever it sits: on a phone the hint sits above
     a full-width button instead of fighting it for the same line. */
  return (
    <div className="@container/action border-t border-line p-3">
      <div className="flex flex-col gap-2.5 @[22rem]/action:flex-row @[22rem]/action:items-center @[22rem]/action:gap-3">
        {hint ? (
          <p className="flex min-w-0 items-center gap-1.5 text-[12px] leading-snug text-ink-muted @[22rem]/action:flex-1">
            {hintGlyph ? (
              <span aria-hidden className="shrink-0 text-ink-subtle">
                {hintGlyph}
              </span>
            ) : null}
            {hint}
          </p>
        ) : (
          <span className="@[22rem]/action:flex-1" />
        )}
        <motion.button
          type="button"
          disabled={disabled}
          onClick={onClick}
          whileTap={disabled ? undefined : { scale: 0.97 }}
          className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-1.5 rounded-full bg-ink px-5 text-[13px] font-semibold text-white transition-colors hover:bg-ink-soft disabled:opacity-35 @[22rem]/action:h-10 @[22rem]/action:w-auto"
        >
          {label}
          {glyph}
        </motion.button>
      </div>
    </div>
  );
}

/** A quiet, bordered action for the "or do the other thing" case. */
export function SecondaryAction({
  label,
  glyph,
  onClick,
}: {
  label: string;
  glyph?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-line bg-surface px-4 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-sunken"
    >
      {glyph}
      {label}
    </motion.button>
  );
}

/** Sliding segmented control — the panel tabs and the mobile view switch. */
export function SegmentedSwitch<T extends string>({
  value,
  options,
  onChange,
  layoutId,
  size = "md",
  className,
}: {
  value: T;
  options: { id: T; label: string; badge?: boolean }[];
  onChange: (next: T) => void;
  /** Unique per instance so two switches don't share one indicator. */
  layoutId: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-line bg-sunken p-1",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.id === value;
        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "relative rounded-full font-semibold transition-colors",
              size === "sm"
                ? "px-3 py-1.5 text-[12px]"
                : "px-4 py-2 text-[13px]",
              active ? "text-ink" : "text-ink-muted hover:text-ink",
            )}
          >
            {active ? (
              <motion.span
                layoutId={layoutId}
                transition={
                  reduceMotion ? { duration: 0 } : { ...SPRING, damping: 34 }
                }
                className="absolute inset-0 rounded-full bg-surface shadow-card"
              />
            ) : null}
            <span className="relative flex items-center gap-1.5">
              {option.label}
              <AnimatePresence>
                {option.badge ? (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="size-1.5 rounded-full bg-accent-edge"
                  />
                ) : null}
              </AnimatePresence>
            </span>
          </button>
        );
      })}
    </div>
  );
}
