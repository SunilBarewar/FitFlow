"use client";

import { useChat } from "@ai-sdk/react";
import { TextStreamChatTransport } from "ai";
import {
  AlertCircle,
  CalendarRange,
  Feather,
  SendHorizonal,
  TrendingUp,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/components/ui/fit-toaster";
import type { useChatConversation } from "@/features/chat/use-chat-conversation";
import { ChatMessageRow, TypingIndicator } from "./chat-message";

const SUGGESTIONS = [
  { id: "plan" as const, label: "Build me a weekly plan", icon: CalendarRange },
  { id: "lighter" as const, label: "Make today lighter", icon: Feather },
  { id: "pain" as const, label: "I have back pain", icon: AlertCircle },
  {
    id: "progress" as const,
    label: "How am I doing this week?",
    icon: TrendingUp,
  },
];

export function ChatPanel({
  conversation,
}: {
  conversation: ReturnType<typeof useChatConversation>;
}) {
  const { messages, isTyping, startSuggestion, syncRealMessage } = conversation;
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isIdle = !messages.some((m) => m.block && !m.resolved);

  const transport = useMemo(
    () => new TextStreamChatTransport({ api: "/api/coach/chat" }),
    [],
  );
  const realChat = useChat({ transport });
  const isRealAgentWaiting = realChat.status === "submitted";

  useEffect(() => {
    for (const message of realChat.messages) {
      const text = message.parts
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("");
      if (!text) continue;
      syncRealMessage(
        message.id,
        message.role === "user" ? "user" : "assistant",
        text,
      );
    }
  }, [realChat.messages, syncRealMessage]);

  useEffect(() => {
    if (!realChat.error) return;
    toast.error("Your coach couldn't respond", {
      description: realChat.error.message || "Please try again.",
    });
  }, [realChat.error]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run on new messages or typing-indicator changes, both of which grow the scroll height.
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, isTyping, isRealAgentWaiting]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    realChat.sendMessage({ text });
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        <div className="mx-auto flex max-w-xl flex-col gap-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <ChatMessageRow
                key={message.id}
                message={message}
                conversation={conversation}
              />
            ))}
            {isTyping || isRealAgentWaiting ? (
              <TypingIndicator key="typing" />
            ) : null}
          </AnimatePresence>

          {isIdle && !isTyping ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
              className="flex flex-wrap gap-2 pt-1"
            >
              {SUGGESTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => startSuggestion(id)}
                  className="inline-flex items-center gap-1.5 rounded-pill border border-border bg-card px-3.5 py-2 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-brand-green-light/40"
                >
                  <Icon size={13} aria-hidden className="text-primary" />
                  {label}
                </button>
              ))}
            </motion.div>
          ) : null}
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
