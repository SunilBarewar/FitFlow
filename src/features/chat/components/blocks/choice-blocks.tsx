"use client";

import { cn } from "cn";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";
import type { ChatBlock } from "@/features/chat/types";
import { DescribedChoices } from "./described-choices";

type ChoiceChipsBlock = Extract<ChatBlock, { type: "choice_chips" }>;
type MultiSelectBlock = Extract<ChatBlock, { type: "multi_select_chips" }>;

const chipStagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const chipItem = {
  hidden: { opacity: 0, y: 6, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1 },
};

export function ChoiceChipsBlock({
  block,
  resolved,
  onSelect,
  onPersistSubmit,
}: {
  block: ChoiceChipsBlock;
  resolved: boolean;
  onSelect: (optionId: string, label: string) => void;
  onPersistSubmit?: (optionId: string) => void;
}) {
  const [clickedId, setClickedId] = useState<string | null>(
    block.selected ?? null,
  );
  const sent = useRef(false);
  const described = block.options.some((option) => option.description);

  if (described) {
    return (
      <DescribedChoices
        options={block.options}
        resolved={resolved}
        initialSelectedId={block.selected}
        onSelect={onSelect}
        onPersistSubmit={onPersistSubmit}
      />
    );
  }

  return (
    <motion.div
      variants={chipStagger}
      initial="hidden"
      animate="show"
      className="flex flex-wrap gap-2 pt-1"
    >
      {block.options.map((option) => {
        const isAnswer = clickedId === option.id;
        const isDimmed = resolved && !isAnswer;
        return (
          <motion.button
            key={option.id}
            type="button"
            variants={chipItem}
            whileTap={resolved ? undefined : { scale: 0.95 }}
            disabled={resolved}
            onClick={() => {
              if (sent.current || resolved) return;
              sent.current = true;
              setClickedId(option.id);
              onSelect(option.id, option.label);
              onPersistSubmit?.(option.id);
            }}
            className={cn(
              "inline-flex h-10 items-center gap-1.5 rounded-pill border px-4 text-sm font-medium transition-colors",
              isAnswer
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-foreground hover:bg-muted",
              isDimmed && "opacity-40",
              !resolved && "cursor-pointer",
            )}
          >
            {isAnswer ? <Check size={14} aria-hidden /> : null}
            {option.label}
          </motion.button>
        );
      })}
    </motion.div>
  );
}

export function MultiSelectChipsBlock({
  block,
  resolved,
  onSubmit,
  onPersistSubmit,
}: {
  block: MultiSelectBlock;
  resolved: boolean;
  onSubmit: (ids: string[], labels: string[]) => void;
  onPersistSubmit?: (ids: string[]) => void;
}) {
  const [selected, setSelected] = useState<string[]>(block.selected ?? []);
  const [submittedIds, setSubmittedIds] = useState<string[] | null>(
    resolved && block.selected ? block.selected : null,
  );
  const sent = useRef(false);

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id],
    );
  }

  return (
    <div className="flex flex-col gap-3 pt-1">
      <motion.div
        variants={chipStagger}
        initial="hidden"
        animate="show"
        className="flex flex-wrap gap-2"
      >
        {block.options.map((option) => {
          const isSelected = resolved
            ? (submittedIds ?? []).includes(option.id)
            : selected.includes(option.id);
          const isDimmed = resolved && !isSelected;
          return (
            <motion.button
              key={option.id}
              type="button"
              variants={chipItem}
              whileTap={resolved ? undefined : { scale: 0.95 }}
              disabled={resolved}
              onClick={() => toggle(option.id)}
              aria-pressed={isSelected}
              className={cn(
                "inline-flex h-10 items-center gap-1.5 rounded-pill border px-4 text-sm font-medium transition-colors",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-muted",
                isDimmed && "opacity-40",
                !resolved && "cursor-pointer",
              )}
            >
              {isSelected ? <Check size={14} aria-hidden /> : null}
              {option.label}
            </motion.button>
          );
        })}
      </motion.div>
      {!resolved ? (
        <button
          type="button"
          disabled={selected.length === 0}
          onClick={() => {
            if (sent.current || selected.length === 0) return;
            sent.current = true;
            const labels = block.options
              .filter((o) => selected.includes(o.id))
              .map((o) => o.label);
            setSubmittedIds(selected);
            onSubmit(selected, labels);
            onPersistSubmit?.(selected);
          }}
          className="self-start rounded-pill bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity disabled:opacity-40"
        >
          Continue
        </button>
      ) : null}
    </div>
  );
}
