import { ArrowLeftRight, Check, Moon } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { SectionHeading } from "./section-heading";

/* Every number here is one the repo can back: the catalogue ships 876
   exercises across 13 equipment types and 17 muscle groups. */

const WEEK_MOVES = [
  { day: "Mon", session: "Upper body · 45 min", state: "done" as const },
  { day: "Tue", session: "Intervals · 25 min", state: "done" as const },
  {
    day: "Wed",
    session: "Lower body · 28 min",
    state: "moved" as const,
    note: "Shortened — you said 30 minutes",
  },
  { day: "Thu", session: "Rest", state: "rest" as const },
];

const LOGGED_SETS = [
  { id: "set-1", reps: "8" },
  { id: "set-2", reps: "8" },
  { id: "set-3", reps: "7" },
  { id: "set-next", reps: "+" },
];

const EQUIPMENT = [
  "Barbell",
  "Dumbbell",
  "Kettlebell",
  "Cable",
  "Bands",
  "Machine",
  "Bodyweight",
];

function Tile({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-line bg-surface p-6 shadow-card sm:p-7",
        className,
      )}
    >
      {children}
    </div>
  );
}

function TileTitle({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return (
    <h3
      className={cn(
        "text-2xl leading-tight font-medium tracking-[-0.035em]",
        tone ?? "text-ink",
      )}
    >
      {children}
    </h3>
  );
}

function TileBody({ children }: { children: React.ReactNode }) {
  return (
    <p className="pt-2.5 text-[15px] leading-relaxed text-pretty text-ink-muted">
      {children}
    </p>
  );
}

export function FeaturesBento() {
  return (
    <section id="features" className="scroll-mt-24 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="What you get"
          title="A plan that survives a real week"
          description="Most plans assume nothing goes wrong. FitFlow assumes it will, and keeps you training anyway."
        />

        <div className="brand-reveal grid grid-cols-1 gap-4 pt-14 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {/* Wide: the week, rearranged */}
          <Tile className="sm:col-span-2">
            <TileTitle tone="text-mint-ink">Your week, rearranged</TileTitle>
            <TileBody>
              Miss a day, cut a session short, or move it to Thursday. The plan
              reshapes around what actually happened.
            </TileBody>
            <ul className="flex flex-col gap-1.5 pt-5">
              {WEEK_MOVES.map((entry) => (
                <li
                  key={entry.day}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border p-2.5 shadow-card",
                    entry.state === "moved"
                      ? "border-accent-edge/40 bg-accent-soft/35"
                      : "border-line bg-surface",
                  )}
                >
                  <span className="w-9 shrink-0 font-brand-mono text-[11px] text-ink-subtle">
                    {entry.day}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-semibold">
                      {entry.session}
                    </span>
                    {entry.note ? (
                      <span className="block truncate text-[11px] text-ink-muted">
                        {entry.note}
                      </span>
                    ) : null}
                  </span>
                  {entry.state === "done" ? (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-mint-tint text-mint-ink">
                      <Check size={11} strokeWidth={3} aria-hidden />
                    </span>
                  ) : entry.state === "rest" ? (
                    <Moon
                      size={13}
                      className="shrink-0 text-ink-subtle"
                      aria-hidden
                    />
                  ) : (
                    <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[9px] font-bold text-white">
                      TODAY
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Tile>

          {/* The catalogue */}
          <Tile>
            <p className="font-brand-mono text-4xl leading-none font-normal sm:text-5xl">
              876
            </p>
            <TileTitle>Exercises, explained</TileTitle>
            <TileBody>
              Step-by-step form notes, muscles worked, and photos for every one
              of them.
            </TileBody>
          </Tile>

          {/* Swaps */}
          <Tile className="border-violet-edge bg-violet-tint">
            <span className="flex size-10 items-center justify-center rounded-full bg-surface text-violet-ink shadow-card">
              <ArrowLeftRight size={17} aria-hidden />
            </span>
            <div className="pt-5">
              <TileTitle tone="text-violet-ink">Swap anything</TileTitle>
              <TileBody>
                Bench taken? Shoulder sore? Get a replacement that hits the same
                muscles with the gear you have.
              </TileBody>
            </div>
          </Tile>

          {/* Rest days */}
          <Tile className="border-sky-edge bg-sky-tint">
            <span className="flex size-10 items-center justify-center rounded-full bg-surface text-sky-ink shadow-card">
              <Moon size={17} aria-hidden />
            </span>
            <div className="pt-5">
              <TileTitle tone="text-sky-ink">Low days count too</TileTitle>
              <TileBody>
                Tell the coach you&apos;re running on empty and you get a
                lighter session, not a lecture.
              </TileBody>
            </div>
          </Tile>

          {/* Logging */}
          <Tile>
            <TileTitle>Logged as you lift</TileTitle>
            <TileBody>
              Tap a set as you finish it. Next week&apos;s weights start from
              what you actually did.
            </TileBody>
            <div className="flex gap-1.5 pt-5" aria-hidden>
              {LOGGED_SETS.map((set, index) => (
                <span
                  key={set.id}
                  className={cn(
                    "flex h-9 flex-1 items-center justify-center rounded-xl font-brand-mono text-[13px]",
                    index < 3
                      ? "bg-sunken text-ink-soft"
                      : "border border-dashed border-line-strong text-ink-subtle",
                  )}
                >
                  {set.reps}
                </span>
              ))}
            </div>
          </Tile>

          {/* Wide: equipment */}
          <Tile className="sm:col-span-2">
            <TileTitle>Built around your gym</TileTitle>
            <TileBody>
              A full rack, two dumbbells, or a hotel room floor — the plan is
              written for the 13 kinds of equipment you say you have.
            </TileBody>
            <div className="flex flex-wrap gap-2 pt-5">
              {EQUIPMENT.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-line bg-canvas px-3 py-1.5 text-[13px] font-medium text-ink-soft"
                >
                  {item}
                </span>
              ))}
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}
