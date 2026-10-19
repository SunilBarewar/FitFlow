import { CalendarDays, Check, MessageSquare } from "lucide-react";
import { SectionHeading } from "./section-heading";
import { WeekRail } from "./week-rail";

const STEPS = [
  {
    index: "01",
    title: "Tell it about you",
    body: "Your goal, the days you can train, the gear you can reach, and anything that hurts. Two minutes, in plain language.",
  },
  {
    index: "02",
    title: "Get the week",
    body: "A full week lands in your plan — training days, rest days, and the reasoning behind both.",
  },
  {
    index: "03",
    title: "Train and talk",
    body: "Log sets as you go. When the week shifts, say so and the plan shifts with it.",
  },
];

const FACTS = [
  { value: "876", label: "exercises in the library" },
  { value: "17", label: "muscle groups covered" },
  { value: "13", label: "kinds of equipment" },
];

function StepVisual({ index }: { index: number }) {
  if (index === 0) {
    return (
      <div className="flex flex-col gap-2">
        {["Build strength", "4 days a week", "Dumbbells at home"].map(
          (answer) => (
            <span
              key={answer}
              className="flex items-center gap-2 rounded-xl bg-surface px-3 py-2 text-[12px] font-medium shadow-card"
            >
              <Check size={12} className="text-mint-ink" aria-hidden />
              {answer}
            </span>
          ),
        )}
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-2">
        <CalendarDays size={22} className="text-ink-subtle" aria-hidden />
        <WeekRail done={0} today={0} className="scale-[1.6]" />
        <span className="font-brand-mono text-[11px] text-ink-muted">
          5 training · 2 rest
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="self-end rounded-xl bg-ink px-3 py-2 text-[12px] text-white">
        Shoulder&apos;s sore today
      </span>
      <span className="flex items-start gap-2 self-start rounded-xl bg-surface px-3 py-2 text-[12px] text-ink-soft shadow-card">
        <MessageSquare
          size={12}
          className="mt-0.5 shrink-0 text-accent-edge"
          aria-hidden
        />
        Swapped to pull-ups and rows.
      </span>
    </div>
  );
}

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-24 border-y border-line bg-sunken/60 py-24 sm:py-32"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="How it works"
          title="Set up once, then just train"
          description="No spreadsheets, no programme to decipher. A conversation, then a week you can follow."
        />

        <div className="brand-reveal grid grid-cols-1 gap-4 pt-14 lg:grid-cols-3 lg:gap-5">
          {STEPS.map((step, index) => (
            <div
              key={step.index}
              className="rounded-[28px] border border-line bg-surface p-2 shadow-card"
            >
              <div className="flex min-h-[148px] flex-col justify-center rounded-[20px] bg-sunken p-5">
                <StepVisual index={index} />
              </div>
              <div className="p-5">
                <p className="font-brand-mono text-[13px] text-accent-edge">
                  {step.index}
                </p>
                <h3 className="pt-2 text-2xl leading-tight font-medium tracking-[-0.035em]">
                  {step.title}
                </h3>
                <p className="pt-2.5 text-[15px] leading-relaxed text-pretty text-ink-muted">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="brand-reveal mt-16 grid grid-cols-1 divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {FACTS.map((fact) => (
            <div
              key={fact.label}
              className="flex flex-col items-center gap-1.5 px-4 py-8"
            >
              <span className="font-brand-mono text-4xl leading-none sm:text-5xl">
                {fact.value}
              </span>
              <span className="text-[13px] text-ink-muted">{fact.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
