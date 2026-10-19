import { Check, Dumbbell, Play, SendHorizonal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/* A still frame of the real thing: the coach on the left, today's
   session on the right. Decorative — every claim it makes is one the
   product already makes. */

const CONVERSATION = [
  {
    from: "you" as const,
    text: "Only got 30 minutes today and my shoulder is sore.",
  },
  {
    from: "coach" as const,
    text: "Then we keep it short and skip overhead work. Three lifts, 28 minutes, nothing above shoulder height.",
  },
  {
    from: "you" as const,
    text: "Rows felt heavy on the last set.",
  },
  {
    from: "coach" as const,
    text: "Noted — I'll hold 20 kg next week instead of adding to it.",
  },
];

const TODAY = [
  { name: "Goblet squat", detail: "3 × 10 · 24 kg", state: "done" as const },
  {
    name: "Romanian deadlift",
    detail: "3 × 8 · 60 kg",
    state: "done" as const,
  },
  {
    name: "Chest-supported row",
    detail: "3 × 12 · 20 kg",
    state: "now" as const,
  },
  {
    name: "Split squat",
    detail: "2 × 12 · bodyweight",
    state: "next" as const,
  },
];

function ExerciseRow({ exercise }: { exercise: (typeof TODAY)[number] }) {
  const isNow = exercise.state === "now";
  const isDone = exercise.state === "done";

  return (
    <li
      className={cn(
        "flex items-center gap-2.5 rounded-2xl border p-2.5 shadow-card",
        isNow
          ? "border-accent-edge/40 bg-accent-soft/35"
          : "border-line bg-surface",
      )}
    >
      <span
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl",
          isDone
            ? "bg-mint-tint text-mint-ink"
            : isNow
              ? "bg-accent-soft text-accent-edge"
              : "bg-sunken text-ink-subtle",
        )}
      >
        {isDone ? (
          <Check size={14} strokeWidth={3} aria-hidden />
        ) : (
          <Dumbbell size={14} aria-hidden />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-[12px] leading-tight font-semibold",
            isDone ? "text-ink-subtle" : "text-ink",
          )}
        >
          {exercise.name}
        </span>
        <span className="block truncate text-[11px] leading-tight text-ink-muted">
          {exercise.detail}
        </span>
      </span>
      {isNow ? (
        <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[9px] font-bold tracking-wide text-white">
          NOW
        </span>
      ) : null}
    </li>
  );
}

export function ProductStage() {
  return (
    <section className="px-4 sm:px-6 lg:px-8">
      <div className="brand-reveal relative mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-stage p-4 sm:p-8 lg:p-12">
        {/* Faint dot grid and two soft glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "radial-gradient(rgb(201 232 214) 1px, transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/4 size-[420px] rounded-full bg-accent-edge/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -bottom-32 size-[380px] rounded-full bg-mint-ink/15 blur-3xl"
        />

        {/* The app window */}
        <div className="relative overflow-hidden rounded-[20px] border border-line bg-canvas shadow-window">
          <div className="flex items-center gap-2 border-b border-line bg-surface px-4 py-2.5">
            <span className="flex gap-1.5" aria-hidden>
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
              <span className="size-2.5 rounded-full bg-line-strong" />
            </span>
            <span className="mx-auto rounded-full bg-sunken px-3 py-0.5 font-brand-mono text-[10px] text-ink-subtle">
              fitflow.app/chat
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_288px] lg:gap-5 lg:p-5">
            {/* Coach conversation */}
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-full bg-accent-soft text-accent-edge">
                  <Sparkles size={13} aria-hidden />
                </span>
                <span className="text-[13px] font-semibold">Your coach</span>
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] text-ink-muted">
                  <span className="size-1.5 rounded-full bg-mint-ink" />
                  Week 6
                </span>
              </div>

              {CONVERSATION.map((message) => (
                <p
                  key={message.text}
                  className={cn(
                    "max-w-[88%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed",
                    message.from === "you"
                      ? "self-end bg-ink text-white"
                      : "self-start border border-line bg-surface text-ink-soft shadow-card",
                  )}
                >
                  {message.text}
                </p>
              ))}

              <div className="mt-auto flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2.5 shadow-card">
                <span className="text-[12px] text-ink-subtle">
                  Ask your coach anything…
                </span>
                <span className="ml-auto flex size-6 items-center justify-center rounded-full bg-ink text-white">
                  <SendHorizonal size={11} aria-hidden />
                </span>
              </div>
            </div>

            {/* Today panel */}
            <div className="flex min-w-0 flex-col gap-3 rounded-[20px] border border-line bg-surface p-3.5 shadow-card">
              <div className="rounded-2xl bg-sunken p-3.5">
                <p className="font-brand-mono text-[10px] tracking-wide text-ink-subtle uppercase">
                  Today · Wednesday
                </p>
                <p className="pt-1 text-[15px] font-medium tracking-[-0.02em]">
                  Lower body · 28 min
                </p>
                <div className="flex items-center gap-2.5 pt-3">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                    <Play
                      size={12}
                      className="ml-0.5 fill-current"
                      aria-hidden
                    />
                  </span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                    <span className="block h-full w-1/2 rounded-full bg-accent-edge" />
                  </span>
                  <span className="shrink-0 font-brand-mono text-[11px] text-ink-muted">
                    2/4
                  </span>
                </div>
              </div>

              <ul className="flex flex-col gap-1.5">
                {TODAY.map((exercise) => (
                  <ExerciseRow key={exercise.name} exercise={exercise} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
