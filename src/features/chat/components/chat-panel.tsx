"use client";

import { AnimatePresence } from "motion/react";
import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/fit-toaster";
import type { useChatConversation } from "@/features/chat/use-chat-conversation";
import { ChatMessageRow, CoachActivityIndicator } from "./chat-message";
import { Composer } from "./composer";
import { EmptyState } from "./empty-state";

export function ChatPanel({
  conversation,
}: {
  conversation: ReturnType<typeof useChatConversation>;
}) {
  const {
    messages,
    isReady,
    userName,
    sendText,
    error,
    showCoachActivity,
    coachActivityLabel,
  } = conversation;
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
    ? `${messages.length}:${lastMessage.id}:${lastMessage.text?.length ?? 0}:${lastMessage.block?.type ?? "none"}:${showCoachActivity}:${isReady}`
    : `empty:${showCoachActivity}:${isReady}`;

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

  // Follow a growing message only while the reader is already at the bottom.
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

  if (messages.length === 0) {
    return <EmptyState userName={userName} onSend={sendText} />;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain [overflow-anchor:none] px-4 py-6 sm:px-6"
      >
        <div
          ref={contentRef}
          className="mx-auto flex max-w-2xl flex-col gap-5 pb-2"
        >
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <ChatMessageRow
                key={message.id}
                message={message}
                conversation={conversation}
                interactive={
                  index === messages.length - 1 &&
                  isReady &&
                  message.role === "assistant"
                }
              />
            ))}
            {showCoachActivity && coachActivityLabel ? (
              <CoachActivityIndicator
                key="coach-activity"
                label={coachActivityLabel}
              />
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <div className="shrink-0 px-4 pt-1 pb-3 sm:px-6 sm:pb-4">
        <div className="mx-auto max-w-2xl">
          <Composer onSend={sendText} />
        </div>
      </div>
    </div>
  );
}
