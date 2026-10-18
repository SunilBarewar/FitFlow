"use client";

import { motion } from "motion/react";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Play,
  Star,
  Activity,
  Flame,
  Dumbbell,
  Target,
  Menu,
  X,
  ClipboardList,
  Repeat2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { FitFlowLogo } from "@/components/brand/fitflow-logo";
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
const NAV_LINKS = ["Features", "Pricing", "Blog", "About"];

const FEATURES = [
  {
    icon: <ClipboardList size={22} />,
    title: "Workout Plans",
    description:
      "Get a weekly plan built around your schedule, equipment, and experience level — not a generic 12-week program.",
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
  { value: "50K+", label: "Active athletes", icon: <Activity size={18} />, delay: 0 },
  { value: "2.1M", label: "Workouts logged", icon: <Dumbbell size={18} />, delay: 0.1 },
  { value: "94%", label: "Goal completion", icon: <Target size={18} />, delay: 0.2 },
  { value: "4.9★", label: "User rating", icon: <Star size={18} />, delay: 0.3 },
];

const TESTIMONIALS = [
  {
    quote: "I've tried every fitness app. FitFlow is the first that actually felt personal — it knew I only had 30 minutes and built around that.",
    name: "Marcus R.",
    role: "Intermediate lifter · 8 months",
    avatar: "MR",
  },
  {
    quote: "The weekly overview and session logging made me consistent for the first time ever. I've hit my plan 11 weeks in a row.",
    name: "Priya S.",
    role: "Beginner · 3 months",
    avatar: "PS",
  },
  {
    quote: "My bench went from 80kg to 110kg in 6 months. Seeing the progress charts every week kept me pushing when I wanted to stop.",
    name: "James T.",
    role: "Advanced · 1 year",
    avatar: "JT",
  },
];

const STEPS = [
  { n: "01", title: "Set up your profile", body: "Tell FitFlow your goal, how many days you can train, what equipment you have, and your experience level." },
  { n: "02", title: "Get your weekly plan", body: "A tailored plan drops straight into your calendar — workouts mapped to your actual schedule, not a generic template." },
  { n: "03", title: "Train, log, and grow", body: "Follow your sessions, log every set as you go, swap exercises when needed, and watch your strength trend upward." },
];

/* ─── Floating phone mockup ─── */
function PhoneMockup() {
  return (
    <div className="relative w-[260px] sm:w-[290px] mx-auto">
      {/* Phone frame */}
      <div className="relative z-10 rounded-[40px] border-4 border-foreground/10 bg-brand-navy overflow-hidden" style={{ aspectRatio: "9/19" }}>
        {/* Status bar */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <span className="text-[10px] text-white/50 font-mono">9:41</span>
          <div className="w-16 h-4 rounded-full bg-brand-navy border border-white/10" />
          <div className="flex gap-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className={cn("w-1 rounded-full bg-white/50", i === 1 ? "h-2" : i === 2 ? "h-3" : "h-4")} />
            ))}
          </div>
        </div>

        {/* App content */}
        <div className="px-4 pb-4 space-y-3">
          <div className="pt-1">
            <p className="text-white/50 text-xs">Good morning</p>
            <p className="text-white text-base font-semibold">Ready for day 3? 💪</p>
          </div>

          {/* Today card */}
          <div className="rounded-2xl bg-primary p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/70 text-[10px] font-medium">TODAY'S SESSION</p>
                <p className="text-primary-foreground text-sm font-semibold">Upper Body Power</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <Play size={12} className="text-primary-foreground ml-0.5" />
              </div>
            </div>
            <div className="flex gap-2">
              {["45 min", "6 ex.", "Mod"].map((tag) => (
                <span key={tag} className="text-[9px] font-medium bg-primary-foreground/15 text-primary-foreground rounded-full px-2 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "This week", value: "3 / 4", color: "text-primary" },
              { label: "Streak", value: "12 days 🔥", color: "text-accent" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/5 border border-white/10 p-2">
                <p className="text-[9px] text-white/40">{s.label}</p>
                <p className={cn("text-xs font-semibold", s.color)}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Exercise list */}
          <div className="space-y-1.5">
            {["Bench Press", "Overhead Press", "Lat Pulldown"].map((ex, i) => (
              <div key={ex} className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-2.5 py-2">
                <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", i === 0 ? "bg-primary" : "bg-white/20")} />
                <p className="text-white/70 text-[10px] font-medium flex-1 truncate">{ex}</p>
                <p className="text-white/30 text-[9px]">4×10</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating cards */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-14 top-16 z-20 rounded-2xl bg-card border border-border px-3 py-2 min-w-[120px]"
      >
        <div className="flex items-center gap-2">
          <Flame size={14} className="text-accent" />
          <div>
            <p className="text-[9px] text-muted-foreground font-medium">CALORIES</p>
            <p className="text-sm font-bold text-foreground">847 kcal</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [4, -4, 4] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute -right-10 top-32 z-20 rounded-2xl bg-card border border-border px-3 py-2"
      >
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-brand-green-light flex items-center justify-center">
            <CheckCircle2 size={12} className="text-primary" />
          </div>
          <div>
            <p className="text-[9px] text-muted-foreground">Streak</p>
            <p className="text-xs font-bold">23 days</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        animate={{ y: [-3, 5, -3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -left-10 bottom-20 z-20 rounded-2xl bg-primary px-3 py-2"
      >
        <p className="text-[9px] text-primary-foreground/70 font-medium">STRENGTH GAIN</p>
        <p className="text-sm font-bold text-primary-foreground">+18% ↑</p>
      </motion.div>
    </div>
  );
}

/* ─── Feature card ─── */
function FeatureCard({ icon, title, description, tint, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="rounded-2xl bg-card border border-border p-6 space-y-4 group hover:-translate-y-0.5 transition-transform duration-200"
    >
      <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", tint)}>
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
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

/* ─── Navbar ─── */
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <FitFlowLogo size={32} priority />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link}
              href={`/${link.toLowerCase()}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {link}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Link
            href="/sign-in"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "rounded-full px-4")}
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className={cn(buttonVariants({ size: "sm" }), "rounded-full px-5 font-semibold")}
          >
            Get started free
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-4 py-4 space-y-1"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link}
              href={`/${link.toLowerCase()}`}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {link}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/sign-in"
              className={cn(buttonVariants({ variant: "outline" }), "rounded-full h-11 w-full")}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className={cn(buttonVariants(), "rounded-full h-11 w-full font-semibold")}
            >
              Get started free
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}

/* ─── Hero ─── */
function Hero() {
  const tags = ["Strength", "HIIT", "Yoga", "Running", "Mobility", "Calisthenics"];

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
              Plans built around your schedule. A library of 500+ exercises. Progress tracking that shows real results. Everything you need to train consistently and get stronger.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.24 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Link
                href="/sign-up"
                className={cn(buttonVariants(), "rounded-full h-13 px-8 text-base font-semibold gap-2")}
              >
                Start for free <ArrowRight size={16} />
              </Link>
              <Link
                href="#how-it-works"
                className={cn(buttonVariants({ variant: "outline" }), "rounded-full h-13 px-8 text-base gap-2 border-border")}
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
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Features</p>
          <h2 className="text-4xl font-bold tracking-tight">
            Everything in one place
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            From planning your week to logging your last rep — FitFlow handles the full fitness workflow so you can just focus on training.
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
    <section id="how-it-works" className="py-20 sm:py-28 bg-card border-y border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-xl mx-auto space-y-4"
        >
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">How it works</p>
          <h2 className="text-4xl font-bold tracking-tight">Up and running in minutes</h2>
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
                  <span className="text-xl font-black text-primary-foreground font-mono">{step.n}</span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.body}</p>
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
          <p className="text-xs font-semibold text-primary uppercase tracking-wider">Testimonials</p>
          <h2 className="text-4xl font-bold tracking-tight">Real people, real results</h2>
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
                  <span className="text-[11px] font-bold text-primary-foreground">{t.avatar}</span>
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
              Join 50,000+ people who train with a plan, log with ease, and actually see results.
            </p>
          </div>
          <div className="relative flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="/sign-up"
              className={cn(
                buttonVariants(),
                "rounded-full h-13 px-8 text-base font-semibold bg-white text-primary hover:bg-white/90 gap-2"
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
              <Link key={l} href="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
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
      <Navbar />
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
