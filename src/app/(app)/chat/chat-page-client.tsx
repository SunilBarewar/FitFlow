"use client";

import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/fit-toaster";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";
import { getErrorMessage } from "@/features/auth/lib/api-client";
import { ChatShell } from "@/features/chat/components/chat-shell";
import { ContextBar } from "@/features/chat/components/context-bar";
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

  async function handleStartNewChat() {
    const cleared = await conversation.startNewChat();
    if (cleared) {
      toast.success("New plan started", {
        description: "Everything has been reset. Let's build your next plan!",
      });
      document.getElementById("coach-chat-main")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
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
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-background">
      <ContextBar
        onStartNewChat={() => void handleStartNewChat()}
        startNewChatPending={conversation.startNewChatPending}
        onSignOut={handleSignOut}
        signOutPending={signOut.isPending}
      />
      <main id="coach-chat-main" className="flex min-h-0 flex-1 flex-col">
        <ChatShell conversation={conversation} />
      </main>
    </div>
  );
}
