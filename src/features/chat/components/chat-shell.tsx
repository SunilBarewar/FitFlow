"use client";

import type { useChatConversation } from "@/features/chat/use-chat-conversation";
import { ChatPanel } from "./chat-panel";
import { LivePanel } from "./live-panel";
import { MobilePinnedCard } from "./mobile-pinned-card";

export function ChatShell({
  conversation,
}: {
  conversation: ReturnType<typeof useChatConversation>;
}) {
  const { hasPlan } = conversation;

  return (
    <div
      className={
        hasPlan
          ? "flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[1fr_440px] xl:grid-cols-[1fr_520px]"
          : "flex min-h-0 flex-1 flex-col"
      }
    >
      {hasPlan ? (
        <div className="flex min-h-0 flex-col lg:hidden">
          <MobilePinnedCard conversation={conversation} />
        </div>
      ) : null}

      <div
        className={
          hasPlan
            ? "flex min-h-0 flex-1 flex-col lg:border-r lg:border-border"
            : "flex min-h-0 flex-1 flex-col"
        }
      >
        <ChatPanel conversation={conversation} />
      </div>

      {hasPlan ? (
        <aside className="hidden min-h-0 flex-col bg-card lg:flex">
          <LivePanel conversation={conversation} />
        </aside>
      ) : null}
    </div>
  );
}
