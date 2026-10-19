"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";
import type { ChatBlock } from "@/features/chat/types";
import { cn } from "@/lib/utils/cn";
import { Indicator, ToggleChip } from "../ui/controls";
import { DescribedChoices } from "./described-choices";

type ChoiceChipsBlock = Extract<ChatBlock, { type: "choice_chips" }>;
type MultiSelectBlock = Extract<ChatBlock, { type: "multi_select_chips" }>;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const chipIn = {
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

  // Options that carry an explanation deserve rows, not chips.
  if (block.options.some((option) => option.description)) {
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
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex flex-wrap gap-2"
    >
      {block.options.map((option) => {
        const isAnswer = clickedId === option.id;
        return (
          <motion.button
            key={option.id}
            type="button"
            variants={chipIn}
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
              "inline-flex min-h-10 items-center gap-2 rounded-full border px-4 text-[13px] font-semibold transition-colors",
              isAnswer
                ? "border-accent-edge/50 bg-accent-soft text-ink"
                : "border-line bg-surface text-ink-soft hover:bg-sunken",
              resolved && !isAnswer && "opacity-45",
              !resolved && "cursor-pointer",
            )}
          >
            {isAnswer ? <Indicator selected /> : null}
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
  const active = submittedIds ?? selected;

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="flex flex-wrap gap-2"
      >
        {block.options.map((option) => {
          const isSelected = active.includes(option.id);
          return (
            <motion.div key={option.id} variants={chipIn}>
              <ToggleChip
                label={option.label}
                selected={isSelected}
                dimmed={resolved && !isSelected}
                disabled={resolved}
                onToggle={() => toggle(option.id)}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {resolved ? null : (
        <motion.button
          type="button"
          disabled={selected.length === 0}
          whileTap={selected.length === 0 ? undefined : { scale: 0.97 }}
          onClick={() => {
            if (sent.current || selected.length === 0) return;
            sent.current = true;
            const labels = block.options
              .filter((option) => selected.includes(option.id))
              .map((option) => option.label);
            setSubmittedIds(selected);
            onSubmit(selected, labels);
            onPersistSubmit?.(selected);
          }}
          className="h-10 self-start rounded-full bg-ink px-5 text-[13px] font-semibold text-white transition-colors hover:bg-ink-soft disabled:opacity-35"
        >
          Continue
        </motion.button>
      )}
    </div>
  );
}
