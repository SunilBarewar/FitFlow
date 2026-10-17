"use client";

import { useChatConversation } from "@/features/chat/use-chat-conversation";
import { ChatPanel } from "./chat-panel";
import { LivePanel } from "./live-panel";
import { MobilePinnedCard } from "./mobile-pinned-card";

export function ChatShell({ userName }: { userName: string }) {
  const conversation = useChatConversation(userName);

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:grid lg:grid-cols-[1fr_400px]">
      <div className="flex min-h-0 flex-col lg:hidden">
        <MobilePinnedCard conversation={conversation} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:border-r lg:border-border">
        <ChatPanel conversation={conversation} />
      </div>

      <aside className="hidden min-h-0 flex-col bg-card lg:flex">
        <LivePanel conversation={conversation} />
      </aside>
    </div>
  );
}
