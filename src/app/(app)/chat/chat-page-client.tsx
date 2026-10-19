"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/fit-toaster";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";
import { getErrorMessage } from "@/features/auth/lib/api-client";
import {
  ChatHeader,
  type WorkspaceView,
} from "@/features/chat/components/chat-header";
import { ChatShell } from "@/features/chat/components/chat-shell";
import type { ConversationData } from "@/features/chat/lib/get-conversation-data";
import { useChatConversation } from "@/features/chat/use-chat-conversation";

export function ChatPageClient({
  userName,
  initialData,
}: {
  userName: string;
  initialData: ConversationData;
}) {
  const router = useRouter();
  const signOut = useSignOut();
  const conversation = useChatConversation(userName, initialData);
  const [view, setView] = useState<WorkspaceView>("coach");

  const { hasPlan, panel } = conversation;
  const highlightTab = panel.highlightTab;

  // When the coach pushes something to the workout side (a new plan, an
  // adjusted session), take the phone there instead of leaving a dot
  // the user has to notice.
  useEffect(() => {
    if (highlightTab) setView("plan");
  }, [highlightTab]);

  // No plan, nothing to switch to.
  useEffect(() => {
    if (!hasPlan) setView("coach");
  }, [hasPlan]);

  async function handleStartNewChat() {
    const cleared = await conversation.startNewChat();
    if (cleared) {
      setView("coach");
      toast.success("New plan started", {
        description: "Everything has been reset. Let's build your next plan!",
      });
      return;
    }
    toast.error("Couldn't start a new chat", {
      description: "Please try again.",
    });
  }

  async function handleSignOut() {
    try {
      await signOut.mutateAsync();
      toast.info("Signed out", {
        description: "See you at your next workout.",
      });
      router.push("/sign-in");
    } catch (err) {
      toast.error("Couldn't sign out", {
        description: getErrorMessage(err, "Please try again."),
      });
    }
  }

  return (
    <div
      id="coach-chat-main"
      className="brand-surface flex h-dvh max-h-dvh flex-col overflow-hidden"
    >
      <ChatHeader
        view={view}
        onViewChange={setView}
        showViewSwitch={hasPlan}
        planBadge={highlightTab !== null}
        onStartNewChat={() => void handleStartNewChat()}
        startNewChatPending={conversation.startNewChatPending}
        onSignOut={handleSignOut}
        signOutPending={signOut.isPending}
      />

      <main className="flex min-h-0 flex-1 flex-col">
        <ChatShell conversation={conversation} view={view} />
      </main>
    </div>
  );
}
