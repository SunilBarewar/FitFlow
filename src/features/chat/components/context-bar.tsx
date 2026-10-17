"use client";

import { Flame, LogOut, Zap } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Profile, ProgressStats } from "@/features/chat/types";

const RADIUS = 15;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ContextBar({
  profile,
  progress,
  onSignOut,
  signOutPending,
}: {
  profile: Profile;
  progress: ProgressStats;
  onSignOut: () => void;
  signOutPending: boolean;
}) {
  const offset = CIRCUMFERENCE * (1 - profile.completeness / 100);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="FitFlow home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
            <Zap size={16} className="text-primary-foreground" aria-hidden />
          </span>
          <span className="hidden text-base font-bold tracking-tight sm:inline">
            FitFlow.
          </span>
        </Link>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-3 sm:gap-4">
          <p className="hidden truncate text-sm text-muted-foreground md:block">
            {profile.goal}
          </p>

          <span className="inline-flex items-center gap-1 rounded-pill bg-brand-coral-light px-2.5 py-1 text-xs font-medium text-accent">
            <Flame size={13} aria-hidden />
            {progress.streakDays} day streak
          </span>

          <div
            className="group relative flex items-center gap-1.5"
            title={`Profile ${profile.completeness}% complete`}
          >
            <svg
              width="34"
              height="34"
              viewBox="0 0 34 34"
              className="-rotate-90"
              role="img"
              aria-labelledby="profile-completeness-title"
            >
              <title id="profile-completeness-title">
                Profile {profile.completeness}% complete
              </title>
              <circle
                cx="17"
                cy="17"
                r={RADIUS}
                fill="none"
                stroke="var(--color-muted)"
                strokeWidth="3"
              />
              <motion.circle
                cx="17"
                cy="17"
                r={RADIUS}
                fill="none"
                stroke="var(--color-primary)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </svg>
            <span className="sr-only">
              Profile {profile.completeness}% complete
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 rounded-xl"
          aria-label="Sign out"
          disabled={signOutPending}
          onClick={onSignOut}
        >
          <LogOut size={20} aria-hidden />
        </Button>
      </div>
    </header>
  );
}
