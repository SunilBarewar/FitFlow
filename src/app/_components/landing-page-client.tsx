"use client";

import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  ClipboardList,
  Dumbbell,
  Play,
  Repeat2,
  Star,
  Target,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { FitFlowLogo } from "@/components/brand/fitflow-logo";
import { buttonVariants } from "@/components/ui/button";
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
  return (
    <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          animate={{ x: [0, 48, 0], y: [0, -32, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 left-[8%] h-[420px] w-[420px] rounded-full bg-brand-green-light opacity-50 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 36, 0], scale: [1.1, 1, 1.1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 right-[4%] h-[380px] w-[380px] rounded-full bg-brand-coral-light opacity-40 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 32, 0], y: [0, -24, 0], scale: [1, 1.15, 1] }}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-40 left-1/2 h-[460px] w-[460px] -translate-x-1/2 rounded-full bg-brand-sky-light opacity-40 blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 h-[540px] w-[540px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10"
        />
        <motion.div
          animate={{ scale: [1.04, 1, 1.04], opacity: [0.35, 0.6, 0.35] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 h-[780px] w-[780px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/5"
        />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-brand-green-light px-4 py-1.5"
          >
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span className="text-xs font-semibold tracking-wider text-primary uppercase">
              Your personal fitness coach
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-8 text-5xl font-bold tracking-tighter text-balance sm:text-6xl lg:text-7xl"
          >
            Fitness that fits{" "}
            <span className="gradient-text">your real life.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            FitFlow is personal coaching for everyday life — thoughtful workout
            plans, gentle guidance, and progress you can actually feel, built
            around your schedule, your energy, and your goals. Show up as you
            are. We&apos;ll help you keep moving forward, one day at a time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.24 }}
            className="mt-10 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants(),
                "h-13 gap-2 rounded-full px-8 text-base font-semibold",
              )}
            >
              Start for free <ArrowRight size={16} />
            </Link>
            <Link
              href="#how-it-works"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-13 gap-2 rounded-full border-border px-8 text-base",
              )}
            >
              <Play size={15} className="fill-current" /> See how it works
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-6 text-sm text-muted-foreground"
          >
            Begin at your own pace — we&apos;ll meet you where you are.
          </motion.p>
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

export function LandingPageClient() {
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
