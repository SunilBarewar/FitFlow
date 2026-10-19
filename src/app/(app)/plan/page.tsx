import { redirect } from "next/navigation";
import type { Plan } from "@/features/chat/types";
import {
  ensureSession,
  getWeekSummary,
} from "@/features/workout/lib/session-store";
import { getSessionFromCookies } from "@/lib/auth/session";
import { getTodayRef } from "@/lib/date/today";
import { connectDB } from "@/lib/db";
import { ConversationModel } from "@/models/conversation";
import { PlanPageClient } from "./plan-page-client";

export default async function PlanPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/sign-in?callbackUrl=/plan");
  }

  const { date, dayLabel } = getTodayRef();

  // No active plan means there is nothing to manage here — the coach is the
  // only place a plan can come from, so that's where the user belongs.
  const workoutSession = await ensureSession(session.sub, date, dayLabel);
  if (!workoutSession) {
    redirect("/chat");
  }

  await connectDB();
  const conversation = await ConversationModel.findOne({
    userId: session.sub,
  })
    .select("activePlan")
    .lean();
  const plan = conversation?.activePlan as Plan | undefined;
  if (!plan) {
    redirect("/chat");
  }

  const week = await getWeekSummary(session.sub, date);

  return (
    <PlanPageClient
      initial={{ session: workoutSession, week }}
      plan={plan}
      userName={session.name?.split(" ")[0] ?? ""}
    />
  );
}
