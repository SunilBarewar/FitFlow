"use client";

import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/fit-toaster";
import { useSignOut } from "@/features/auth/hooks/use-sign-out";
import { getErrorMessage } from "@/features/auth/lib/api-client";
import type { Plan } from "@/features/chat/types";
import { HomeHeader } from "@/features/workout/components/home-header";
import { WorkoutHome } from "@/features/workout/components/workout-home";
import type { WorkoutHomeData } from "@/features/workout/use-workout-session";

export function PlanPageClient({
  initial,
  plan,
}: {
  initial: WorkoutHomeData;
  plan: Plan;
  userName: string;
}) {
  const router = useRouter();
  const signOut = useSignOut();

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
    <div className="brand-surface flex h-dvh max-h-dvh flex-col overflow-hidden">
      <HomeHeader
        onSignOut={handleSignOut}
        signOutPending={signOut.isPending}
      />
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain lg:overflow-hidden">
        <WorkoutHome initial={initial} plan={plan} />
      </main>
    </div>
  );
}
