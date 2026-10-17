"use client";

import { MessageCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChatShell } from "@/features/chat/components/chat-shell";
import { ContextBar } from "@/features/chat/components/context-bar";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/fit-toaster";
import { useSession } from "@/features/auth/hooks/use-session";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";
import { getErrorMessage } from "@/features/auth/lib/api-client";
import { mockProfile, mockProgress } from "@/features/chat/mock-data";

function ChatSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-40 rounded-lg bg-muted animate-pulse" />
          <div className="h-4 w-56 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="h-11 w-11 rounded-xl bg-muted animate-pulse" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-card p-8">
        <div className="h-14 w-14 rounded-2xl bg-muted animate-pulse" />
        <div className="h-5 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="h-4 w-full max-w-xs rounded-lg bg-muted animate-pulse" />
      </div>
    </div>
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
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6">
      <div className="rounded-2xl bg-destructive/10 p-4 text-destructive">
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

  const firstName = user.name.split(" ")[0] ?? user.name;

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
    <div className="flex h-screen flex-col bg-background">
      <ContextBar
        profile={{ ...mockProfile, name: firstName }}
        progress={mockProgress}
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
        <ChatShell userName={firstName} />
      </main>
    </div>
  );
}
