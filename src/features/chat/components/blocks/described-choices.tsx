"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";
import type { SetupOption } from "@/features/chat/setup-options";
import { OptionRow } from "../ui/controls";

type Choice = Pick<SetupOption, "id" | "label"> & { description?: string };

const TONES = ["accent", "mint", "sky", "violet"] as const;

/** A short list of answers, each with a line explaining it. One tap sends. */
export function DescribedChoices({
  options,
  glyphs,
  resolved,
  initialSelectedId,
  onSelect,
  onPersistSubmit,
}: {
  options: Choice[];
  /** Drawn marks keyed by option id — see ../ui/glyphs. */
  glyphs?: Record<string, React.ReactNode>;
  resolved: boolean;
  initialSelectedId?: string;
  onSelect: (optionId: string, label: string) => void;
  onPersistSubmit?: (id: string) => void;
}) {
  const [clickedId, setClickedId] = useState<string | null>(
    initialSelectedId ?? null,
  );
  const sent = useRef(false);
  const known = clickedId !== null;

  return (
    <fieldset className="flex w-full flex-col gap-2 border-0 p-0">
      <legend className="sr-only">Choose one</legend>
      {options.map((option, index) => (
        <motion.div
          key={option.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: index * 0.05, ease: "easeOut" }}
        >
          <OptionRow
            role="radio"
            title={option.label}
            description={option.description}
            glyph={glyphs?.[option.id]}
            tone={TONES[index % TONES.length]}
            selected={clickedId === option.id}
            dimmed={known && resolved && clickedId !== option.id}
            disabled={resolved || known}
            onSelect={() => {
              if (sent.current || resolved) return;
              sent.current = true;
              setClickedId(option.id);
              onSelect(option.id, option.label);
              onPersistSubmit?.(option.id);
            }}
          />
        </motion.div>
      ))}
    </fieldset>
  );
}
