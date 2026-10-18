"use client";

import { cn } from "cn";
import {
  CalendarRange,
  HeartPulse,
  MessageCircle,
  Moon,
  SendHorizonal,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

const SUGGESTIONS = [
  {
    icon: Zap,
    label: "Workout for today",
    prompt:
      "I'd like a workout for today. Please ask how much time I have, where I'm training, and what equipment I have, then build a session I can start right away.",
  },
  {
    icon: MessageCircle,
    label: "Ask a fitness question",
    prompt:
      "I have a fitness question I'd like your help with. Please ask me what it is, then answer it in simple terms and tell me how I can apply it.",
  },
  {
    icon: Moon,
    label: "I'm low on energy",
    prompt:
      "I'm low on energy today, but I still want to do something good for my body. Please ask how I'm feeling, then suggest a lighter session, mobility work, or rest — whatever fits best.",
  },
  {
    icon: HeartPulse,
    label: "Something hurts",
    prompt:
      "I have some pain or an old injury that I need to be careful about. Please ask where it is and what makes it worse, then help me train in a way that avoids aggravating it.",
  },
  {
    icon: CalendarRange,
    label: "Build a weekly routine",
    prompt:
      "I'd like you to build me a weekly workout routine. Please ask about my goal, schedule, experience, and equipment, then create a routine that fits my week.",
  },
] as const;

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" as const },
  },
};

function timeOfDayGreeting(date: Date) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function EmptyState({
  userName,
  onSend,
}: {
  userName: string;
  onSend: (text: string) => void;
}) {
  const [draft, setDraft] = useState("");
  const canSend = draft.trim().length > 0;
  const greeting = useMemo(() => timeOfDayGreeting(new Date()), []);

  function submitDraft() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    onSend(text);
  }

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    submitDraft();
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-y-auto">
      {/* Soft tinted backdrop — decoration only, adds no height */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-[80%] rounded-full bg-brand-green-light opacity-60 blur-3xl" />
        <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-brand-coral-light opacity-50 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10" />
        <div className="absolute top-1/2 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/5" />
      </div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative m-auto flex w-full max-w-xl flex-col items-center gap-5 px-4 py-6 text-center sm:gap-6"
      >
        <motion.div variants={item} className="space-y-2.5">
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {greeting}
            {userName ? `, ${userName}` : ""}.
            <span className="block text-primary">
              How can I help you today?
            </span>
          </h1>
          <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            I&apos;m here for more than workouts — a fitness question, an easier
            day, a sore spot, or a full routine. Whatever&apos;s on your mind,
            we&apos;ll sort it out together.
          </p>
        </motion.div>

        <motion.form variants={item} onSubmit={handleSubmit} className="w-full">
          <div className="flex items-end gap-2 rounded-3xl border border-border bg-card p-2 transition-colors duration-200 focus-within:border-primary/60">
            <label htmlFor="coach-first-message" className="sr-only">
              Message your coach
            </label>
            <textarea
              id="coach-first-message"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submitDraft();
                }
              }}
              rows={2}
              placeholder="Ask me anything…"
              className="flex-1 resize-none bg-transparent px-3 py-2 text-base leading-relaxed outline-none placeholder:text-muted-foreground/70"
            />
            <button
              type="submit"
              disabled={!canSend}
              aria-label="Send message"
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-200",
                canSend
                  ? "opacity-100 hover:bg-primary/90 active:scale-95"
                  : "opacity-40",
              )}
            >
              <SendHorizonal size={18} aria-hidden />
            </button>
          </div>
        </motion.form>

        <motion.div
          variants={item}
          className="flex max-w-xl flex-wrap justify-center gap-2"
        >
          {SUGGESTIONS.map(({ icon: Icon, label, prompt }) => (
            <button
              key={label}
              type="button"
              onClick={() => onSend(prompt)}
              className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-border bg-card px-4 text-sm font-medium whitespace-nowrap text-foreground transition-colors duration-200 hover:border-primary/40 hover:bg-brand-green-light/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:bg-brand-green-light/60"
            >
              <Icon size={15} aria-hidden className="shrink-0 text-primary" />
              {label}
            </button>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
