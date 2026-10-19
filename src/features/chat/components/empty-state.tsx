"use client";

import { motion } from "motion/react";
import { useMemo } from "react";
import { ChatAiDisclosure } from "./chat-ai-disclosure";
import { Composer } from "./composer";
import { EasyWaveMark, LowEnergyMark, WeekMark } from "./ui/glyphs";

const SUGGESTIONS = [
  {
    glyph: <WeekMark size={15} />,
    label: "Build a weekly routine",
    prompt: "Can you help me set up a weekly workout routine?",
  },
  {
    glyph: <LowEnergyMark size={15} />,
    label: "I'm low on energy",
    prompt:
      "I'm really low on energy today but I still want to move. What would you suggest?",
  },
  {
    glyph: <EasyWaveMark size={15} />,
    label: "Have lower back pain",
    prompt:
      "I have lower back pain after sitting in an office chair for long hours. Could you suggest some exercises I can do to feel better?",
  },
] as const;

function timeOfDayGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function EmptyState({
  userName,
  onSend,
  initialDraft,
}: {
  userName: string;
  onSend: (text: string) => void;
  /** A question carried over from the workout page (?prefill=). */
  initialDraft?: string;
}) {
  const greeting = useMemo(() => timeOfDayGreeting(new Date()), []);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain">
      <div className="m-auto flex w-full max-w-xl flex-col gap-7 px-4 py-10 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <h1 className="text-[34px] leading-[1.05] font-normal tracking-[-0.03em] text-balance sm:text-[40px] text-center">
            {greeting}
            {userName ? `, ${userName}` : ""}.
            <span className="block text-ink-subtle">
              What are we doing today?
            </span>
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: 0.08,
            ease: [0.2, 0.7, 0.2, 1],
          }}
        >
          <Composer
            onSend={onSend}
            variant="hero"
            placeholder="Tell me anything — how you're feeling, what you want to train"
            initialDraft={initialDraft}
          />
          <ChatAiDisclosure />
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.05, delayChildren: 0.15 },
            },
          }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {SUGGESTIONS.map(({ glyph, label, prompt }) => (
            <motion.button
              key={label}
              type="button"
              variants={{
                hidden: { opacity: 0, y: 8 },
                show: { opacity: 1, y: 0 },
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSend(prompt)}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line bg-surface px-3.5 text-[13px] font-medium text-ink-soft shadow-card transition-colors hover:bg-sunken"
            >
              <span className="shrink-0 text-accent-edge">{glyph}</span>
              {label}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
