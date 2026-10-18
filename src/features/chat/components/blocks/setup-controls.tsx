"use client";

import { cn } from "cn";
import { Check } from "lucide-react";
import type { ReactNode } from "react";

export function SetupCard({ children }: { children: ReactNode }) {
  return (
    <div className="w-full rounded-xl border border-border bg-card p-3 sm:p-4">
      {children}
    </div>
  );
}

export function DisclosureSwitch({
  id,
  checked,
  disabled,
  label,
  hint,
  onChange,
}: {
  id: string;
  checked: boolean;
  disabled?: boolean;
  label: string;
  hint: string;
  onChange: (next: boolean) => void;
}) {
  const labelId = `${id}-switch`;

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-muted px-3 py-1">
      <p id={labelId} className="text-sm leading-snug">
        <span className="font-medium text-foreground">{label}</span>{" "}
        <span className="text-muted-foreground">{hint}</span>
      </p>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="flex h-11 w-16 shrink-0 items-center justify-center rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-40"
      >
        <span
          className={cn(
            "flex h-7 w-12 items-center rounded-pill p-1 transition-colors duration-200 motion-reduce:transition-none",
            checked ? "bg-primary" : "border border-border bg-background",
          )}
        >
          <span
            className={cn(
              "size-5 rounded-full transition-transform duration-200 motion-reduce:transition-none",
              checked
                ? "translate-x-5 bg-primary-foreground"
                : "bg-muted-foreground/70",
            )}
          />
        </span>
      </button>
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
      className="min-h-11 self-start rounded-pill bg-primary px-6 text-sm font-semibold text-primary-foreground outline-none transition-opacity duration-150 hover:bg-primary/90 focus-visible:ring-3 focus-visible:ring-ring/50 active:bg-primary/80 disabled:opacity-40"
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
