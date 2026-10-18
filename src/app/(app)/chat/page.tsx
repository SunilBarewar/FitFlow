"use client";

import { MessageCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/fit-toaster";
import { useSession } from "@/features/auth/hooks/use-session";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";
import { getErrorMessage } from "@/features/auth/lib/api-client";
import { ChatShell } from "@/features/chat/components/chat-shell";
import { ContextBar } from "@/features/chat/components/context-bar";
import { useChatConversation } from "@/features/chat/use-chat-conversation";

function ChatSkeleton() {
  return (
    <>
      <div
        className="m-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center gap-5 px-4 py-6 sm:gap-6"
        aria-hidden
      >
        <div className="flex flex-col items-center gap-2.5">
          <div className="h-9 w-40 rounded-lg bg-muted animate-pulse sm:h-10" />
          <div className="h-9 w-64 max-w-full rounded-lg bg-muted animate-pulse sm:h-10 sm:w-80" />
          <div className="mt-1 h-4 w-72 max-w-full rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="h-24 w-full rounded-3xl bg-muted animate-pulse" />
        <div className="flex max-w-xl flex-wrap justify-center gap-2">
          {["w-40", "w-52", "w-44",  "w-52"].map((width) => (
            <div
              key={width}
              className={`h-11 max-w-full rounded-pill bg-muted animate-pulse ${width}`}
            />
          ))}
        </div>
      </div>
      <output className="sr-only">Loading your coach…</output>
    </>
  );
}

function ChatError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-16 text-center sm:px-6">
      <div className="flex w-full flex-col items-center gap-4 rounded-3xl border border-border bg-card p-6 sm:p-8">
        <div className="rounded-3xl bg-destructive/10 p-4 text-destructive">
          <MessageCircle size={28} aria-hidden />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight">
            We couldn&apos;t load your session
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>
        <Button
          type="button"
          className="rounded-pill h-12 px-6 gap-2"
          onClick={onRetry}
        >
          <RefreshCw size={18} aria-hidden />
          Try again
        </Button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const {
    data: user,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useSession();
  const signOut = useSignOut();
  const conversation = useChatConversation(user?.name.split(" ")[0] ?? "");

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <ChatSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <ChatError
          message={getErrorMessage(
            error,
            "Your progress is safe — give it another try.",
          )}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6">
        <p className="text-sm text-muted-foreground">
          You need to sign in to open chat.
        </p>
        <Link
          href="/sign-in?callbackUrl=/chat"
          className="inline-flex min-h-12 items-center justify-center rounded-pill bg-primary px-8 text-base font-semibold text-primary-foreground"
        >
          Sign in
        </Link>
      </div>
    );
  }

  async function handleSignOut() {
    try {
      await signOut.mutateAsync();
      toast.info("Signed out", {
        description: "See you at your next workout.",
      });
      router.push("/sign-in");
    } catch (err) {
      toast.error("Couldn’t sign out", {
        description: getErrorMessage(err, "Please try again."),
      });
    }
  }

  return (
    <div className="flex h-dvh max-h-dvh flex-col overflow-hidden bg-background">
      <ContextBar
        onStartNewChat={() => void conversation.startNewChat()}
        startNewChatPending={conversation.startNewChatPending}
        onSignOut={handleSignOut}
        signOutPending={signOut.isPending}
      />

      {isFetching && !isLoading ? (
        <p
          className="border-b border-border bg-card py-1.5 text-center text-xs text-muted-foreground"
          aria-live="polite"
        >
          Refreshing session…
        </p>
      ) : null}

      <main className="flex min-h-0 flex-1 flex-col">
        <ChatShell conversation={conversation} />
      </main>
    </div>
  );
}
