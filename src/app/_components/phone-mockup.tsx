"use client";

import {
  BatteryFull,
  CalendarDays,
  Check,
  Flame,
  Home,
  MessageCircle,
  Play,
  Sparkles,
  Trophy,
  User,
  Wifi,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { exerciseImageUrl } from "@/lib/exercises/image-url";
import { cn } from "@/lib/utils/cn";

/* ─── Hero phone mockup (currently unused) ───
   Kept for future use — the landing hero is copy-only for now.
   Usage: import { PhoneMockup } from "@/app/_components/phone-mockup"
   A believable moment from the real app, mid-workout: two exercises done,
   the current one open at set 3, and the coach's note that prompted the
   next weight. Decorative — the copy beside it carries the message. */
const MOCK_EXERCISES = [
  {
    name: "Barbell Bench Press",
    detail: "4 × 8 · 60 kg",
    image: "Barbell_Bench_Press_-_Medium_Grip/0.jpg",
    state: "done" as const,
  },
  {
    name: "Incline Dumbbell Press",
    detail: "3 × 10 · 22 kg",
    image: "Incline_Dumbbell_Press/0.jpg",
    state: "done" as const,
  },
  {
    name: "Lat Pulldown",
    detail: "3 × 12 · 55 kg",
    image: "Full_Range-Of-Motion_Lat_Pulldown/0.jpg",
    state: "current" as const,
  },
  {
    name: "Dumbbell Shoulder Press",
    detail: "3 × 10 · 18 kg",
    image: "Dumbbell_Shoulder_Press/0.jpg",
    state: "next" as const,
  },
];

function MockExerciseRow({
  exercise,
}: {
  exercise: (typeof MOCK_EXERCISES)[number];
}) {
  const isCurrent = exercise.state === "current";
  const isDone = exercise.state === "done";
  return (
    <li
      className={cn(
        "rounded-xl border p-2",
        isCurrent
          ? "border-primary/40 bg-brand-green-light/50"
          : "border-border bg-card",
      )}
    >
      <div className="flex items-center gap-2.5">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image
            src={exerciseImageUrl(exercise.image)}
            alt=""
            fill
            sizes="36px"
            className={cn("object-cover", isDone && "opacity-70")}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-[11px] leading-tight font-semibold",
              isDone ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {exercise.name}
          </p>
          <p className="text-[10px] leading-tight text-muted-foreground">
            {isCurrent ? "Set 3 of 3 · " : ""}
            {exercise.detail}
          </p>
        </div>
        {isDone ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check size={11} strokeWidth={3} aria-hidden />
          </span>
        ) : isCurrent ? (
          <span className="shrink-0 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-primary-foreground">
            NOW
          </span>
        ) : (
          <span className="shrink-0 text-[10px] font-medium text-muted-foreground">
            Up next
          </span>
        )}
      </div>

      {/* Set-by-set logging for the exercise in progress */}
      {isCurrent ? (
        <div className="mt-2 flex gap-1.5" aria-hidden>
          {["8 reps", "8 reps", "Log set"].map((set, i) => (
            <span
              key={set}
              className={cn(
                "flex h-6 flex-1 items-center justify-center gap-1 rounded-lg text-[9px] font-semibold",
                i < 2
                  ? "bg-primary/15 text-primary"
                  : "bg-primary text-primary-foreground",
              )}
            >
              {i < 2 ? <Check size={9} strokeWidth={3} aria-hidden /> : null}
              {set}
            </span>
          ))}
        </div>
      ) : null}
    </li>
  );
}

export function PhoneMockup() {
  return (
    <div aria-hidden className="relative mx-auto w-[272px] sm:w-[296px]">
      {/* Soft brand glow + tilted week card peeking from behind */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-green-light opacity-60 blur-3xl" />
      <div className="absolute inset-0 translate-x-5 translate-y-3 rotate-[5deg] rounded-[48px] border border-border bg-brand-sky-light/70" />

      {/* Phone bezel + side buttons */}
      <div className="absolute top-28 -right-[2px] h-16 w-[3px] rounded-full bg-foreground/70" />
      <div className="absolute top-24 -left-[2px] h-10 w-[3px] rounded-full bg-foreground/70" />
      <div className="absolute top-36 -left-[2px] h-10 w-[3px] rounded-full bg-foreground/70" />
      <div className="relative z-10 rounded-[46px] bg-foreground p-[9px]">
        <div
          className="relative flex flex-col overflow-hidden rounded-[38px] bg-background"
          style={{ aspectRatio: "9/19" }}
        >
          {/* Status bar + dynamic island */}
          <div className="relative flex items-center justify-between px-6 pt-3.5">
            <span className="text-[10px] font-semibold text-foreground">
              9:41
            </span>
            <span className="absolute top-2.5 left-1/2 h-[18px] w-16 -translate-x-1/2 rounded-full bg-foreground" />
            <span className="flex items-center gap-1 text-foreground">
              <Wifi size={11} aria-hidden />
              <BatteryFull size={14} aria-hidden />
            </span>
          </div>

          {/* App header */}
          <div className="flex items-center justify-between px-4 pt-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                A
              </span>
              <div>
                <p className="text-[10px] leading-tight text-muted-foreground">
                  Tuesday · Day 3
                </p>
                <p className="text-[13px] leading-tight font-semibold">
                  Morning, Alex
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-brand-coral-light px-2 py-1 text-[10px] font-bold text-accent">
              <Flame size={11} aria-hidden /> 12
            </span>
          </div>

          {/* Today's session — mirrors the app's TodayCard */}
          <div className="px-4 pt-3">
            <div className="rounded-2xl bg-primary p-3.5 text-primary-foreground">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[9px] font-semibold tracking-wider text-primary-foreground/70 uppercase">
                    Today&apos;s session
                  </p>
                  <p className="mt-0.5 text-sm font-bold">
                    Upper body strength
                  </p>
                  <p className="mt-0.5 text-[10px] text-primary-foreground/80">
                    45 min · 2 of 4 exercises done
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-foreground text-primary">
                  <Play size={14} className="ml-0.5 fill-current" aria-hidden />
                </span>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-primary-foreground/25">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "50%" }}
                  transition={{ duration: 0.9, delay: 0.7, ease: "easeOut" }}
                  className="h-full rounded-full bg-primary-foreground"
                />
              </div>
            </div>
          </div>

          {/* Week strip */}
          <div className="flex items-center justify-between px-5 pt-3">
            {[
              { id: "mon", d: "M", n: 1, done: true },
              { id: "tue", d: "T", n: 2, done: true },
              { id: "wed", d: "W", n: 3, done: false, today: true },
              { id: "thu", d: "T", n: 4, done: false },
              { id: "fri", d: "F", n: 5, done: false },
              { id: "sat", d: "S", n: 6, done: false },
              { id: "sun", d: "S", n: 7, done: false, rest: true },
            ].map((day) => (
              <span key={day.id} className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-medium text-muted-foreground">
                  {day.d}
                </span>
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold",
                    day.done
                      ? "bg-primary text-primary-foreground"
                      : day.today
                        ? "border-2 border-primary text-primary"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {day.done ? (
                    <Check size={10} strokeWidth={3} aria-hidden />
                  ) : day.rest ? (
                    "–"
                  ) : (
                    day.n
                  )}
                </span>
              </span>
            ))}
          </div>

          {/* Exercises */}
          <ul className="space-y-1.5 px-4 pt-3">
            {MOCK_EXERCISES.map((exercise) => (
              <MockExerciseRow key={exercise.name} exercise={exercise} />
            ))}
          </ul>

          {/* Bottom nav */}
          <div className="mt-auto flex items-center justify-around border-t border-border bg-card px-2 pt-2 pb-4">
            {[
              { icon: Home, label: "Today", active: true },
              { icon: CalendarDays, label: "Week", active: false },
              { icon: MessageCircle, label: "Coach", active: false },
              { icon: User, label: "Profile", active: false },
            ].map((item) => (
              <span
                key={item.label}
                className={cn(
                  "flex flex-col items-center gap-0.5",
                  item.active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <span className="relative">
                  <item.icon size={17} aria-hidden />
                  {item.label === "Coach" ? (
                    <span className="absolute -top-0.5 -right-1 h-1.5 w-1.5 rounded-full bg-accent" />
                  ) : null}
                </span>
                <span className="text-[8px] font-semibold">{item.label}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Coach note — the product's differentiator, not a vanity stat */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="absolute top-24 -left-3 z-20 w-[168px] sm:-left-16"
      >
        <motion.div
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="rounded-xl border border-border bg-card p-3"
        >
          <div className="flex items-center gap-1.5">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-green-light text-primary">
              <Sparkles size={11} aria-hidden />
            </span>
            <p className="text-[10px] font-bold">Your coach</p>
          </div>
          <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">
            Bench moved well last week — try{" "}
            <span className="font-semibold text-foreground">62.5 kg</span> on
            the last set.
          </p>
        </motion.div>
      </motion.div>

      {/* PR toast */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.1 }}
        className="absolute -right-3 bottom-28 z-20 sm:-right-12"
      >
        <motion.div
          animate={{ y: [3, -3, 3] }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6,
          }}
          className="flex items-center gap-2 rounded-xl border border-border bg-card py-2 pr-3 pl-2"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-coral-light text-accent">
            <Trophy size={14} aria-hidden />
          </span>
          <span>
            <span className="block text-[9px] font-medium text-muted-foreground">
              New personal best
            </span>
            <span className="block text-[11px] font-bold">
              Bench press · 62.5 kg × 8
            </span>
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
