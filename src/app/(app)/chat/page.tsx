"use client";

import { LogOut, MessageCircle, RefreshCw, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/fit-toaster";
import { useSession } from "@/features/auth/hooks/use-session";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";
import { getErrorMessage } from "@/features/auth/lib/api-client";

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

function ChatError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center gap-4 px-4 py-16 text-center sm:px-6">
      <div className="rounded-2xl bg-destructive/10 p-4 text-destructive">
        <MessageCircle size={28} aria-hidden />
      </div>
      <div className="space-y-2">
        <h1 className="text-xl font-semibold tracking-tight">
          We couldn&apos;t load your session
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
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
  const { data: user, isLoading, isError, error, refetch, isFetching } =
    useSession();
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
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2"
            aria-label="FitFlow home"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
              <Zap size={16} className="text-primary-foreground" aria-hidden />
            </span>
            <span className="text-base font-bold tracking-tight">FitFlow.</span>
          </Link>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-xl h-11 w-11"
            aria-label="Sign out"
            disabled={signOut.isPending}
            onClick={handleSignOut}
          >
            <LogOut size={20} aria-hidden />
          </Button>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-6 sm:px-6">
        <div className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Coach chat</h1>
          <p className="text-sm text-muted-foreground">
            Hi {firstName} — ask anything about your plan or today&apos;s
            workout.
          </p>
        </div>

        <div
          className="flex flex-1 flex-col items-center justify-center gap-4 rounded-3xl border border-border bg-brand-green-light/40 p-8 text-center min-h-[280px]"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <MessageCircle size={28} aria-hidden />
          </span>
          <div className="space-y-2 max-w-sm">
            <h2 className="text-lg font-semibold">No messages yet</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              When chat goes live, your coach will meet you here. For now,
              explore your plan from the home screen.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-pill border border-border bg-background px-6 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Back to home
          </Link>
        </div>

        {isFetching && !isLoading ? (
          <p className="mt-4 text-center text-xs text-muted-foreground" aria-live="polite">
            Refreshing session…
          </p>
        ) : null}
      </main>
    </div>
  );
}
