"use client";

import { cn } from "cn";
import {
  Check,
  ChevronDown,
  type LucideIcon,
  SlidersHorizontal,
} from "lucide-react";
import { type ReactNode, useState } from "react";

export function SetupCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-3 sm:p-4">
      {children}
    </div>
  );
}

/**
 * Visible heading for a setup block, so the card still makes sense
 * when scrolled back to without the coach's question above it.
 * `status` is the at-a-glance answer state (e.g. "3 picked", "Saved").
 */
export function SetupCardHeader({
  icon: Icon,
  title,
  subtitle,
  status,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  status?: string;
}) {
  return (
    <div className="mb-3 flex items-start gap-3">
      <span
        aria-hidden
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-green-light text-primary"
      >
        <Icon size={20} />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-base font-semibold leading-snug text-foreground">
          {title}
        </h3>
        <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
          {subtitle}
        </p>
      </div>
      {status ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-brand-green-light px-2.5 py-1 text-xs font-semibold text-primary">
          <Check size={12} aria-hidden />
          {status}
        </span>
      ) : null}
    </div>
  );
}

/** Small overline that separates the fast path from fine-tuning. */
export function SetupSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </p>
  );
}

/**
 * One preset answer: a radio disguised as a tappable card with an
 * icon, a plain-language title, and a line that helps you choose.
 * Selection is shown with a filled check, not colour alone.
 */
export function PresetOption({
  name,
  title,
  description,
  icon: Icon,
  iconSurface,
  selected,
  dimmed,
  disabled,
  onSelect,
}: {
  name: string;
  title: string;
  description: string;
  icon: LucideIcon;
  iconSurface: string;
  selected: boolean;
  dimmed?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      name={name}
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        "flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors duration-150",
        "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        selected
          ? "border-primary bg-brand-green-light/70"
          : "border-border bg-background hover:bg-muted active:bg-muted",
        dimmed && "opacity-40",
        disabled ? "cursor-default" : "cursor-pointer",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-lg",
          iconSurface,
        )}
      >
        <Icon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold leading-snug text-foreground">
          {title}
        </span>
        <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
          {description}
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40 text-transparent",
        )}
      >
        <Check size={12} strokeWidth={3} />
      </span>
    </button>
  );
}

/**
 * Collapsed-by-default "fine-tune" section for a setup block.
 * Presets above it are the fast path; this accordion is full control.
 * `summary` should describe the hidden state (e.g. "3 of 12 selected")
 * so a collapsed, customised selection is never invisible.
 * Stays expandable when the block is resolved so users can review
 * what they picked — the chips inside remain disabled.
 */
export function SetupAccordion({
  label,
  summary,
  defaultOpen = false,
  children,
}: {
  label: string;
  summary: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
      className={cn(
        "mt-3 overflow-hidden rounded-xl border border-border bg-background transition-colors duration-150",
        open && "border-primary/50",
      )}
    >
      <summary className="flex min-h-[52px] cursor-pointer list-none items-center gap-3 px-3 py-2 outline-none transition-colors duration-150 hover:bg-muted active:bg-muted focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-ring/50 [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-secondary-foreground"
        >
          <SlidersHorizontal size={16} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium leading-snug text-foreground">
            {label}
          </span>
          <span className="block truncate text-sm leading-snug text-muted-foreground">
            {summary}
          </span>
        </span>
        <ChevronDown
          size={20}
          aria-hidden
          className={cn(
            "shrink-0 text-muted-foreground transition-transform duration-200 ease-out motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </summary>
      <div className="border-t border-border p-3">{children}</div>
    </details>
  );
}

/**
 * Card footer: a live one-line summary of what's picked on the left,
 * the single primary action on the right. The summary doubles as the
 * "why is Continue disabled" explanation when nothing is selected.
 */
export function SetupFooter({
  message,
  disabled,
  onContinue,
}: {
  message: string;
  disabled: boolean;
  onContinue: () => void;
}) {
  return (
    <div className="mt-4 flex items-center gap-3 border-t border-border pt-3">
      <p className="min-w-0 flex-1 text-sm leading-snug text-muted-foreground">
        {message}
      </p>
      <ContinueButton disabled={disabled} onClick={onContinue} />
    </div>
  );
}

export function ContinueButton({
  disabled,
  onClick,
}: {
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="min-h-11 shrink-0 self-start rounded-pill bg-primary px-6 text-sm font-semibold text-primary-foreground outline-none transition-opacity duration-150 hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-primary/80 disabled:opacity-40"
    >
      Continue
    </button>
  );
}

export function SelectableChip({
  label,
  selected,
  dimmed,
  disabled,
  onClick,
}: {
  label: string;
  selected: boolean;
  dimmed?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex min-h-11 items-center gap-1.5 rounded-pill border px-3.5 text-sm font-medium transition-colors duration-150",
        "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        selected
          ? "border-primary bg-brand-green-light text-primary"
          : "border-border bg-background text-foreground hover:bg-muted active:bg-muted",
        dimmed && "opacity-40",
        disabled ? "cursor-default" : "cursor-pointer",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-sm border",
          selected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card",
        )}
      >
        {selected ? <Check size={12} /> : null}
      </span>
      {label}
    </button>
  );
}
