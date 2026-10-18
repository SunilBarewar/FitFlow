"use client";

import {
  Activity,
  ArrowRight,
  BarChart3,
  BatteryFull,
  CalendarDays,
  Check,
  ClipboardList,
  Dumbbell,
  Flame,
  Home,
  MessageCircle,
  Play,
  Repeat2,
  Sparkles,
  Star,
  Target,
  Trophy,
  User,
  Wifi,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { FitFlowLogo } from "@/components/brand/fitflow-logo";
import { buttonVariants } from "@/components/ui/button";
import { exerciseImageUrl } from "@/lib/exercises/image-url";
import { cn } from "@/lib/utils/cn";

/* ─── Types ─── */
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  tint: string;
  delay: number;
}

interface StatCardProps {
  value: string;
  label: string;
  icon: React.ReactNode;
  delay: number;
}

/* ─── Constants ─── */
const FEATURES = [
  {
    icon: <ClipboardList size={22} />,
    title: "Workout Plans",
    description:
      "Get a weekly plan built around your schedule, your equipment, and how training has actually been going.",
    tint: "bg-brand-green-light text-primary",
    delay: 0.1,
  },
  {
    icon: <Dumbbell size={22} />,
    title: "Exercise Library",
    description:
      "500+ exercises with step-by-step instructions, muscle targets, and ready-to-use alternatives.",
    tint: "bg-brand-coral-light text-accent",
    delay: 0.15,
  },
  {
    icon: <BarChart3 size={22} />,
    title: "Progress Tracking",
    description:
      "Log every set, see strength trends over time, and get weekly reviews that show you exactly how far you've come.",
    tint: "bg-brand-sky-light text-info",
    delay: 0.2,
  },
  {
    icon: <Repeat2 size={22} />,
    title: "Adaptive Scheduling",
    description:
      "Life gets in the way. Reschedule a session, swap an exercise, or shorten a workout — your plan adjusts without missing a beat.",
    tint: "bg-brand-green-light text-primary",
    delay: 0.25,
  },
  {
    icon: <CalendarDays size={22} />,
    title: "Weekly Overview",
    description:
      "See your full week at a glance — what's planned, what's done, and what's coming next. Stay one step ahead.",
    tint: "bg-brand-coral-light text-accent",
    delay: 0.3,
  },
  {
    icon: <Target size={22} />,
    title: "Goal Setting",
    description:
      "Set a clear goal — strength, fat loss, endurance, or consistency — and every plan, session, and metric is aligned to it.",
    tint: "bg-brand-sky-light text-info",
    delay: 0.35,
  },
];

const STATS = [
  {
    value: "50K+",
    label: "Active athletes",
    icon: <Activity size={18} />,
    delay: 0,
  },
  {
    value: "2.1M",
    label: "Workouts logged",
    icon: <Dumbbell size={18} />,
    delay: 0.1,
  },
  {
    value: "94%",
    label: "Goal completion",
    icon: <Target size={18} />,
    delay: 0.2,
  },
  { value: "4.9★", label: "User rating", icon: <Star size={18} />, delay: 0.3 },
];

const TESTIMONIALS = [
  {
    quote:
      "I've tried every fitness app. FitFlow is the first that actually felt personal — it knew I only had 30 minutes and built around that.",
    name: "Marcus R.",
    role: "Trains 4 days a week · 8 months",
    avatar: "MR",
  },
  {
    quote:
      "The weekly overview and session logging made me consistent for the first time ever. I've hit my plan 11 weeks in a row.",
    name: "Priya S.",
    role: "Just getting started · 3 months",
    avatar: "PS",
  },
  {
    quote:
      "My bench went from 80kg to 110kg in 6 months. Seeing the progress charts every week kept me pushing when I wanted to stop.",
    name: "James T.",
    role: "Trains regularly · 1 year",
    avatar: "JT",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Set up your profile",
    body: "Tell FitFlow your goal, what you have to work with, and how training has been going. The week starts as five training days and two rest days.",
  },
  {
    n: "02",
    title: "Get your weekly plan",
    body: "A tailored plan drops straight into your calendar — workouts mapped to your actual schedule, not a generic template.",
  },
  {
    n: "03",
    title: "Train, log, and grow",
    body: "Follow your sessions, log every set as you go, swap exercises when needed, and watch your strength trend upward.",
  },
];

/* ─── Hero phone mockup ───
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

function PhoneMockup() {
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

/* ─── Feature card ─── */
function FeatureCard({
  icon,
  title,
  description,
  tint,
  delay,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="rounded-2xl bg-card border border-border p-6 space-y-4 group hover:-translate-y-0.5 transition-transform duration-200"
    >
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center",
          tint,
        )}
      >
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Stat card ─── */
function StatCard({ value, label, icon, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
      className="flex flex-col items-center gap-2 p-6"
    >
      <div className="w-10 h-10 rounded-full bg-brand-green-light flex items-center justify-center text-primary">
        {icon}
      </div>
      <p className="text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </motion.div>
  );
}

/* ─── Hero ─── */
function Hero() {
  const tags = [
    "Strength",
    "HIIT",
    "Yoga",
    "Running",
    "Mobility",
    "Calisthenics",
  ];

  return (
    <section className="relative pt-28 pb-20 sm:pt-36 sm:pb-28 overflow-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-brand-green-light opacity-40 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] rounded-full bg-brand-coral-light opacity-30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: copy */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-brand-green-light border border-primary/20 px-4 py-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Trusted by 50,000+ athletes
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.08 }}
              className="text-5xl sm:text-6xl font-bold tracking-tighter leading-[1.05]"
            >
              The workout app{" "}
              <span className="gradient-text">you'll actually use.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.16 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-lg"
            >
              Plans built around your schedule. A library of 500+ exercises.
              Progress tracking that shows real results. Everything you need to
              train consistently and get stronger.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants(),
                  "rounded-full h-13 px-8 text-base font-semibold gap-2",
                )}
              >
                Start for free <ArrowRight size={16} />
              </Link>
              <Link
                href="#how-it-works"
                className={cn(
                  buttonVariants({ variant: "outline" }),
                  "rounded-full h-13 px-8 text-base gap-2 border-border",
                )}
              >
                <Play size={15} className="fill-current" /> See how it works
              </Link>
            </motion.div>

            {/* Floating tag chips */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap gap-2"
            >
              {tags.map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.06 }}
                  className="rounded-full bg-muted border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          </div>

          {/* Right: phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, delay: 0.2, ease: "easeOut" }}
            className="flex justify-center lg:justify-end"
          >
            <PhoneMockup />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Stats bar ─── */
function StatsBar() {
  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
          {STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Features ─── */
function Features() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto space-y-4"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            Features
          </p>
          <h2 className="text-4xl font-bold tracking-tight">
            Everything in one place
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            From planning your week to logging your last rep — FitFlow handles
            the full fitness workflow so you can just focus on training.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <FeatureCard key={f.title} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How it works ─── */
function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="py-20 sm:py-28 bg-card border-y border-border"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto space-y-4"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            How it works
          </p>
          <h2 className="text-4xl font-bold tracking-tight">
            Up and running in minutes
          </h2>
        </motion.div>

        <div className="relative">
          {/* Connector line — desktop */}
          <div className="hidden lg:block absolute top-8 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-border" />

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-6 relative">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="flex flex-col items-start lg:items-center text-left lg:text-center gap-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-black text-primary-foreground font-mono">
                    {step.n}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.body}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */
function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto space-y-4"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">
            Testimonials
          </p>
          <h2 className="text-4xl font-bold tracking-tight">
            Real people, real results
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-2xl bg-card border border-border p-6 space-y-5"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="fill-accent text-accent" />
                ))}
              </div>
              <blockquote className="text-sm leading-relaxed text-foreground">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <span className="text-[11px] font-bold text-primary-foreground">
                    {t.avatar}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── CTA banner ─── */
function CTABanner() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl bg-primary p-10 sm:p-16 flex flex-col sm:flex-row items-center justify-between gap-8 overflow-hidden relative"
        >
          {/* Background decoration */}
          <div className="pointer-events-none absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 translate-x-1/3 -translate-y-1/3" />
          <div className="pointer-events-none absolute bottom-0 left-20 w-48 h-48 rounded-full bg-white/5 translate-y-1/2" />

          <div className="relative space-y-3 text-center sm:text-left">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-primary-foreground">
              Your next workout is waiting.
            </h2>
            <p className="text-primary-foreground/75 max-w-md text-base leading-relaxed">
              Join 50,000+ people who train with a plan, log with ease, and
              actually see results.
            </p>
          </div>
          <div className="relative flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants(),
                "rounded-full h-13 px-8 text-base font-semibold bg-white text-primary hover:bg-white/90 gap-2",
              )}
            >
              Start for free <ArrowRight size={16} />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <FitFlowLogo size={24} />
          <p className="text-xs text-muted-foreground">
            © 2026 FitFlow Inc. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <Link
                key={l}
                href="#"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─── */
export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTABanner />
      </main>
      <Footer />
    </div>
  );
}
