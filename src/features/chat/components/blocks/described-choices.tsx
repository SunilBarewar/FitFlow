"use client";

import { cn } from "cn";
import { Check, ChevronRight, type LucideIcon } from "lucide-react";
import { useRef, useState } from "react";
import type { SetupOption } from "@/features/chat/setup-options";

type Choice = Pick<SetupOption, "id" | "label"> & {
  description?: string;
};

export function DescribedChoices({
  options,
  icons,
  resolved,
  onSelect,
}: {
  options: Choice[];
  icons?: Record<string, LucideIcon>;
  resolved: boolean;
  onSelect: (optionId: string, label: string) => void;
}) {
  const [clickedId, setClickedId] = useState<string | null>(null);
  const sent = useRef(false);
  const known = clickedId !== null;

  return (
    <fieldset className="flex w-full flex-col gap-2 border-0 p-0">
      <legend className="sr-only">Choose one</legend>
      {options.map((option) => {
        const Icon = icons?.[option.id];
        const isAnswer = clickedId === option.id;
        const isDimmed = known && resolved && !isAnswer;
        return (
          <button
            key={option.id}
            type="button"
            disabled={resolved || known}
            onClick={() => {
              if (sent.current || resolved) return;
              sent.current = true;
              setClickedId(option.id);
              onSelect(option.id, option.label);
            }}
            className={cn(
              "flex min-h-11 w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-colors duration-150",
              "outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              isAnswer
                ? "border-primary bg-brand-green-light/70"
                : "border-border bg-card hover:bg-muted active:bg-muted",
              isDimmed && "opacity-40",
              resolved ? "cursor-default" : "cursor-pointer",
            )}
          >
            {Icon ? (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-green-light text-primary">
                <Icon size={18} aria-hidden />
              </span>
            ) : null}
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold leading-snug text-foreground">
                {option.label}
              </span>
              {option.description ? (
                <span className="mt-0.5 block text-sm leading-snug text-muted-foreground">
                  {option.description}
                </span>
              ) : null}
            </span>
            {isAnswer ? (
              <Check size={18} aria-hidden className="shrink-0 text-primary" />
            ) : (
              <ChevronRight
                size={18}
                aria-hidden
                className="shrink-0 text-muted-foreground"
              />
            )}
          </button>
        );
      })}
    </fieldset>
  );
}
