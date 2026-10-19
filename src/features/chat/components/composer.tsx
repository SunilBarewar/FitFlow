"use client";

import { motion } from "motion/react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { EnterMark, SendMark } from "./ui/glyphs";

const MAX_HEIGHT = 180;

/* One composer, two shapes.
   "inline" sits under the thread: a single line that grows as you type.
   "hero" is the first thing on an empty screen: a real multi-line box
   you can write a paragraph into, with the send action beneath it.
   Focus is shown on the box, never as a rectangle inside the pill. */
export function Composer({
  onSend,
  placeholder = "Ask your coach anything…",
  autoFocus = false,
  variant = "inline",
  initialDraft = "",
}: {
  onSend: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  variant?: "inline" | "hero";
  /** Seeded from ?prefill= when the user arrived here from the home page
   * asking for something specific. Never sent on their behalf. */
  initialDraft?: string;
}) {
  const [draft, setDraft] = useState(initialDraft);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const canSend = draft.trim().length > 0;
  const isHero = variant === "hero";

  function resize(field: HTMLTextAreaElement) {
    field.style.height = "auto";
    field.style.height = `${Math.min(field.scrollHeight, MAX_HEIGHT)}px`;
  }

  function submit() {
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    const field = textareaRef.current;
    if (field) field.style.height = "";
    onSend(text);
  }

  const field = (
    <textarea
      id="coach-composer"
      ref={textareaRef}
      // biome-ignore lint/a11y/noAutofocus: the empty screen is a single-purpose prompt — the cursor belongs in it.
      autoFocus={autoFocus}
      value={draft}
      rows={isHero ? 3 : 1}
      onChange={(event) => {
        setDraft(event.target.value);
        if (!isHero) resize(event.target);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          submit();
        }
      }}
      placeholder={placeholder}
      className={cn(
        "w-full resize-none bg-transparent text-ink outline-none",
        "placeholder:text-ink-subtle focus-visible:outline-none",
        isHero
          ? "min-h-20 text-[16px] leading-relaxed"
          : "max-h-45 min-h-9 flex-1 px-3 py-2 text-[15px] leading-relaxed",
      )}
    />
  );

  const sendButton = (
    <motion.button
      type="submit"
      disabled={!canSend}
      whileTap={canSend ? { scale: 0.92 } : undefined}
      aria-label="Send message"
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-full transition-colors",
        canSend
          ? "bg-ink text-white hover:bg-ink-soft"
          : "bg-sunken text-ink-subtle",
      )}
    >
      <SendMark size={18} />
    </motion.button>
  );

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className={cn(
        "rounded-[22px] border border-line bg-surface shadow-card transition-colors",
        "focus-within:border-accent-edge/70 focus-within:ring-3 focus-within:ring-accent-edge/15",
        isHero ? "p-3.5" : "flex items-end gap-2 p-2",
      )}
    >
      <label htmlFor="coach-composer" className="sr-only">
        Message your coach
      </label>

      {isHero ? (
        <>
          {field}
          <div className="flex items-center justify-between gap-3 pt-2">
            <p className="hidden items-center gap-1.5 text-[12px] text-ink-subtle sm:flex">
              <EnterMark size={12} /> Enter to send · Shift+Enter for a new line
            </p>
            <span className="ml-auto">{sendButton}</span>
          </div>
        </>
      ) : (
        <>
          {field}
          {sendButton}
        </>
      )}
    </form>
  );
}
