"use client";

import { SendHorizonal } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "@/components/ui/fit-toaster";
import type { useChatConversation } from "@/features/chat/use-chat-conversation";
import { ChatMessageRow, TypingIndicator } from "./chat-message";
import { EmptyState } from "./empty-state";

export function ChatPanel({
  conversation,
}: {
  conversation: ReturnType<typeof useChatConversation>;
}) {
  const { messages, isWaiting, userName, sendText, error } = conversation;
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!error) return;
    toast.error("Your coach couldn't respond", {
      description: error.message || "Please try again.",
    });
  }, [error]);

  const lastMessage = messages.at(-1);
  const scrollKey = lastMessage
    ? `${messages.length}:${lastMessage.id}:${lastMessage.text?.length ?? 0}:${lastMessage.block?.type ?? "none"}:${isWaiting}`
    : `empty:${isWaiting}`;

  // biome-ignore lint/correctness/useExhaustiveDependencies: scrollKey captures message growth and widget attach without relying on array identity.
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    const scrollToBottom = () => {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    };

    scrollToBottom();
    const frame = requestAnimationFrame(scrollToBottom);
    return () => cancelAnimationFrame(frame);
  }, [scrollKey]);

  useEffect(() => {
    const scrollEl = scrollRef.current;
    const contentEl = contentRef.current;
    if (!scrollEl || !contentEl) return;

    const observer = new ResizeObserver(() => {
      const distanceFromBottom =
        scrollEl.scrollHeight - scrollEl.scrollTop - scrollEl.clientHeight;
      if (distanceFromBottom > 120) return;
      scrollEl.scrollTop = scrollEl.scrollHeight;
    });

    observer.observe(contentEl);
    return () => observer.disconnect();
  }, []);

  function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    sendText(text);
  }

  if (messages.length === 0) {
    return <EmptyState userName={userName} onSend={sendText} />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [overflow-anchor:none] px-4 py-5 sm:px-6"
      >
        <div ref={contentRef} className="mx-auto flex max-w-xl flex-col gap-4">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <ChatMessageRow
                key={message.id}
                message={message}
                conversation={conversation}
                interactive={index === messages.length - 1 && !isWaiting}
              />
            ))}
            {isWaiting ? <TypingIndicator key="typing" /> : null}
          </AnimatePresence>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border-t border-border bg-card/80 px-4 py-3 backdrop-blur-sm sm:px-6"
      >
        <div className="mx-auto flex max-w-xl items-center gap-2">
          <label htmlFor="coach-composer" className="sr-only">
            Message your coach
          </label>
          <input
            id="coach-composer"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask your coach anything…"
            className="h-11 flex-1 rounded-pill border border-border bg-background px-4 text-sm outline-none transition-colors focus:border-primary"
          />
          <button
            type="submit"
            disabled={draft.trim().length === 0}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-40"
          >
            <SendHorizonal size={17} aria-hidden />
          </button>
        </div>
      </form>
    </div>
  );
}
