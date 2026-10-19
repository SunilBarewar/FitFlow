"use client";

import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils/cn";

/* ─── The drawing vocabulary ───
   Hand-built marks instead of a stock icon set. One grammar holds them
   together: a 24-unit grid, 1.6 strokes in `currentColor` with round
   caps, and at most one filled shape per mark. Where a picture can
   carry the answer itself — which muscles, how long, what week — the
   mark becomes a small diagram that reads the live data, not a label
   sitting next to it. */

type GlyphProps = { className?: string; size?: number };

function Svg({
  size = 20,
  className,
  children,
  viewBox = "0 0 24 24",
}: GlyphProps & { children: React.ReactNode; viewBox?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      {children}
    </svg>
  );
}

/* ── Marks ── */

/** The tick that confirms a choice — drawn with a slight lean, not a V. */
export function Tick({ className, size = 12 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M4.5 13c1.9.7 3.4 2 4.6 3.9C11.6 12.3 15 8.4 19.5 5.8"
        strokeWidth={2.6}
      />
    </Svg>
  );
}

/** A caret that points the way open. */
export function Caret({ className, size = 18 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M6 9.5 12 15l6-5.5" />
    </Svg>
  );
}

/** Rising weeks — how much training is already behind you. */
export function HistoryMark({
  level,
  className,
  size = 20,
}: GlyphProps & { level: "new" | "returning" | "regular" }) {
  const filled = level === "new" ? 1 : level === "returning" ? 2 : 3;
  const bars = [
    { x: 4, y: 14, h: 6 },
    { x: 10.5, y: 10, h: 10 },
    { x: 17, y: 5.5, h: 14.5 },
  ];

  return (
    <Svg size={size} className={className}>
      {bars.map((bar, index) => (
        <rect
          key={bar.x}
          x={bar.x - 1.5}
          y={bar.y}
          width={3}
          height={bar.h}
          rx={1.5}
          fill={index < filled ? "currentColor" : "none"}
          opacity={index < filled ? 1 : 0.45}
        />
      ))}
    </Svg>
  );
}

/** A squat rack: uprights, a loaded bar, a plate on the floor. */
export function RackMark({ className, size = 20 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M5.5 20V4.5M18.5 20V4.5" strokeWidth={2} />
      <path d="M5.5 9h13" strokeWidth={2.4} />
      <circle cx="12" cy="16" r="3.2" />
    </Svg>
  );
}

/** A mat on the floor under a window — training at home. */
export function HomeMark({ className, size = 20 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M4.2 10.6 12 4.5l7.8 6.1V19a1 1 0 0 1-1 1H5.2a1 1 0 0 1-1-1v-8.4Z" />
      <path d="M8.2 16.6h7.6" strokeWidth={2.2} />
    </Svg>
  );
}

/** Equipment, drawn one piece at a time. */
export function KitMark({
  id,
  className,
  size = 18,
}: GlyphProps & { id: string }) {
  const marks: Record<string, React.ReactNode> = {
    barbell: (
      <>
        <path d="M3 12h18" strokeWidth={1.8} />
        <path d="M5.5 8.5v7M8 9.5v5M16 9.5v5M18.5 8.5v7" />
      </>
    ),
    dumbbell: (
      <>
        <path d="M7.5 12h9" strokeWidth={2.2} />
        <rect
          x="2.5"
          y="7"
          width="5"
          height="10"
          rx="2.2"
          fill="currentColor"
          stroke="none"
        />
        <rect
          x="16.5"
          y="7"
          width="5"
          height="10"
          rx="2.2"
          fill="currentColor"
          stroke="none"
        />
      </>
    ),
    kettlebells: (
      <>
        <path d="M9 7.5a3 3 0 0 1 6 0" />
        <path d="M9.4 8.2C7 9.4 5.5 12 5.5 14.8A4.2 4.2 0 0 0 9.7 19h4.6a4.2 4.2 0 0 0 4.2-4.2c0-2.8-1.5-5.4-3.9-6.6" />
      </>
    ),
    bands: (
      <>
        <path d="M4 15c2-4 4-4 6 0s4 4 6 0" />
        <circle cx="3" cy="15" r="1.3" fill="currentColor" stroke="none" />
        <circle cx="17" cy="11.6" r="1.3" fill="currentColor" stroke="none" />
      </>
    ),
    cable: (
      <>
        <circle cx="7" cy="6.5" r="2.5" />
        <path d="M7 9v6.5a3 3 0 0 0 3 3h4" />
        <path d="M16.5 16.5h3" strokeWidth={2} />
      </>
    ),
    machine: (
      <>
        <path d="M4 20V6a2 2 0 0 1 2-2h3" />
        <rect x="9.5" y="9" width="10" height="6" rx="2" />
        <path d="M4 13h5" />
      </>
    ),
    "body only": (
      <>
        <circle cx="12" cy="5.5" r="2.2" />
        <path d="M12 8v6M12 10.5 7.5 8M12 10.5 16.5 8M12 14l-3 6M12 14l3 6" />
      </>
    ),
    "exercise ball": (
      <>
        <circle cx="12" cy="12" r="7.5" />
        <path d="M5.5 9c4.5 2 8.5 2 13 0M8 18.5c1-4.5 1-8.5 0-13" />
      </>
    ),
    "medicine ball": (
      <>
        <circle cx="12" cy="12" r="7.5" />
        <path d="M9.2 5.2c2 4.5 2 9.1 0 13.6M14.8 5.2c-2 4.5-2 9.1 0 13.6" />
      </>
    ),
    "foam roll": (
      <>
        <rect x="3" y="8" width="18" height="8" rx="4" />
        <path d="M7.5 8v8M16.5 8v8" />
      </>
    ),
    "e-z curl bar": (
      <>
        <path d="M3 12h3.5l2-2.5 2.5 5 2.5-5 2 2.5H21" strokeWidth={1.8} />
      </>
    ),
    other: (
      <>
        <circle cx="6" cy="12" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="18" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </>
    ),
  };

  return (
    <Svg size={size} className={className}>
      {marks[id] ?? marks.other}
    </Svg>
  );
}

/** An empty day: a ring with nothing in it. */
export function RestMark({ className, size = 20 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="7.5" strokeDasharray="2.5 3.5" opacity={0.7} />
      <path d="M8.5 12h7" strokeWidth={2} />
    </Svg>
  );
}

/** A clock face that shows the slice, rather than a generic clock. */
export function MinutesMark({
  minutes,
  className,
  size = 20,
}: GlyphProps & { minutes: number }) {
  const fraction = Math.min(minutes, 60) / 60;
  const radius = 8;
  const circumference = 2 * Math.PI * radius;

  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r={radius} opacity={0.35} />
      <circle
        cx="12"
        cy="12"
        r={radius}
        strokeWidth={2.2}
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - fraction)}
        transform="rotate(-90 12 12)"
      />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Two arrows trading places — a swap, not a refresh. */
export function SwapMark({ className, size = 20 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M4 9h13l-3-3M20 15H7l3 3" />
    </Svg>
  );
}

/** A flexed arm — the mark for choosing muscles one at a time. */
export function FlexMark({ className, size = 18 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M4 17.5v-3a3 3 0 0 1 3-3h4.5" />
      <path d="M11.5 11.5c2.6 0 4.2-1.4 4.8-4.2.3-1.4 1.3-2.1 2.4-1.8 1.1.3 1.6 1.4 1.3 2.8-1 4.6-4 7.2-8.5 7.2" />
      <path d="M4 17.5h8" strokeWidth={2} />
    </Svg>
  );
}

/** A cog — the mark for setting something by hand instead of by preset. */
export function GearMark({ className, size = 18 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="3.1" />
      <path d="M12 3.2l1.5 2.3 2.7-.6.5 2.7 2.5 1.1-1.3 2.4 1.3 2.4-2.5 1.1-.5 2.7-2.7-.6L12 20.8l-1.5-2.3-2.7.6-.5-2.7-2.5-1.1L6.1 12 4.8 9.6l2.5-1.1.5-2.7 2.7.6L12 3.2Z" />
    </Svg>
  );
}

/** A quiet aside — used where a line explains rather than asks. */
export function InfoMark({ className, size = 14 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5" strokeWidth={1.9} />
      <circle cx="12" cy="7.9" r="1" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Onward. */
export function ArrowMark({ className, size = 16 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M4 12h15M13.5 6.5 20 12l-6.5 5.5" strokeWidth={1.9} />
    </Svg>
  );
}

/** Breathe: two arcs settling around a point. Used where we ask for care. */
export function CautionMark({ className, size = 20 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M12 5.5v6.8" strokeWidth={2} />
      <path
        d="M6.2 8.6a8 8 0 0 0 1.4 10.2M17.8 8.6a8 8 0 0 1-1.4 10.2"
        opacity={0.5}
      />
      <circle cx="12" cy="16" r="1.3" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** A heartbeat that dips — the mark for "this needs a clinician". */
export function PulseMark({ className, size = 20 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M3 13h3.2l2-5 3 10 2.4-7 1.6 2H21" strokeWidth={1.8} />
    </Svg>
  );
}

/** A slow wave — easy, restorative movement. */
export function EasyWaveMark({ className, size = 20 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M3 10c2.2-3 4.3-3 6.5 0s4.3 3 6.5 0 4.3-3 5 0" opacity={0.55} />
      <path d="M3 16c2.2-3 4.3-3 6.5 0s4.3 3 6.5 0 4.3-3 5 0" />
    </Svg>
  );
}

/** Start: a triangle with a soft nose, not a media button. */
export function PlayMark({ className, size = 16 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path
        d="M9 6.3c0-.9 1-1.5 1.8-1l7 5.1c.7.5.7 1.6 0 2.1l-7 5.1c-.8.6-1.8 0-1.8-1V6.3Z"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  );
}

/** Step past this one: an arrow meeting a wall. */
export function SkipMark({ className, size = 16 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M4 7.5 10 12l-6 4.5zM12 7.5 18 12l-6 4.5z" />
      <path d="M20 6.5v11" strokeWidth={2} />
    </Svg>
  );
}

/** A written line — leaving a note for the coach. */
export function NoteMark({ className, size = 16 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M4 18.5c3-1.2 4.5-3.2 4.5-6" />
      <path d="M8.5 15.5 18 6a2.1 2.1 0 0 1 3 3l-9.5 9.5-4 1.5Z" />
    </Svg>
  );
}

/** Seven marks in a row: a week, with nothing in it yet. */
export function WeekMark({ className, size = 20 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      {[4, 7.3, 10.6, 13.9, 17.2].map((x, index) => (
        <path
          key={x}
          d={`M${x} ${index % 2 === 0 ? 8 : 10}v${index % 2 === 0 ? 8 : 4}`}
          strokeWidth={2.2}
          opacity={index % 2 === 0 ? 1 : 0.45}
        />
      ))}
    </Svg>
  );
}

/** A line that sags — the shape of a low-energy day. */
export function LowEnergyMark({ className, size = 16 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M3.5 7c3.5 0 4.5 10 8.5 10s5-7 8.5-7" opacity={0.45} />
      <path d="M3.5 12c3.5 0 4.5 6 8.5 6s5-4 8.5-4" />
    </Svg>
  );
}

/** A question, drawn as a mark inside a spoken shape. */
export function AskMark({ className, size = 16 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M12 4c4.4 0 8 2.9 8 6.5s-3.6 6.5-8 6.5c-.9 0-1.8-.1-2.6-.4L5 19l.8-3.1C4.7 14.8 4 12.8 4 10.5 4 6.9 7.6 4 12 4Z" />
      <path
        d="M10.4 9.1a1.7 1.7 0 0 1 3.2.7c0 1.1-1.6 1.3-1.6 2.3"
        strokeWidth={1.5}
      />
      <circle cx="12" cy="14" r=".9" fill="currentColor" stroke="none" />
    </Svg>
  );
}

/** Send: a stroke leaving the page. */
export function SendMark({ className, size = 18 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M12 19.5V5.5" strokeWidth={2} />
      <path d="M6 11.2 12 5l6 6.2" strokeWidth={2} />
    </Svg>
  );
}

/** The return key, for the "Enter to send" hint. */
export function EnterMark({ className, size = 12 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M20 5v6.5a3 3 0 0 1-3 3H5" />
      <path d="M8.5 11 5 14.5 8.5 18" />
    </Svg>
  );
}

/** You: a head and shoulders, drawn in two strokes. */
export function AccountMark({ className, size = 18 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <circle cx="12" cy="8.5" r="3.4" />
      <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
    </Svg>
  );
}

/** Begin again: a loop that comes back round. */
export function RestartMark({ className, size = 17 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M19.5 12a7.5 7.5 0 1 1-2.6-5.7" />
      <path d="M19.8 4.5v4.2h-4.2" />
    </Svg>
  );
}

/** Out: a stroke leaving through an opening. */
export function ExitMark({ className, size = 17 }: GlyphProps) {
  return (
    <Svg size={size} className={className}>
      <path d="M14 5.5H7.5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2H14" />
      <path d="M11.5 12h9M17.5 8.5 21 12l-3.5 3.5" />
    </Svg>
  );
}

/* ── Diagrams: marks that carry the data itself ── */

/** Before and after, as two bars you can compare at a glance. */
export function SessionDelta({
  fromMinutes,
  toMinutes,
  className,
}: {
  fromMinutes: number;
  toMinutes: number;
  className?: string;
}) {
  const longest = Math.max(fromMinutes, toMinutes, 1);
  const reduceMotion = useReducedMotion();

  const bar = (minutes: number, tone: "before" | "after") => {
    const width = Math.max((minutes / longest) * 100, 8);
    return (
      <div className="flex items-center gap-2.5">
        <span className="w-11 shrink-0 font-brand-mono text-[11px] text-ink-subtle">
          {tone === "before" ? "was" : "now"}
        </span>
        <span className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-sunken">
          <motion.span
            initial={reduceMotion ? false : { width: 0 }}
            animate={{ width: `${width}%` }}
            transition={{
              duration: 0.5,
              ease: [0.2, 0.7, 0.2, 1],
              delay: tone === "after" ? 0.12 : 0,
            }}
            className={cn(
              "block h-full rounded-full",
              tone === "before" ? "bg-line-strong" : "bg-accent-edge",
            )}
          />
        </span>
        <span
          className={cn(
            "w-14 shrink-0 text-right font-brand-mono text-[12px]",
            tone === "before" ? "text-ink-subtle line-through" : "text-ink",
          )}
        >
          {minutes} min
        </span>
      </div>
    );
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {bar(fromMinutes, "before")}
      {bar(toMinutes, "after")}
    </div>
  );
}

/** A week at a glance: a bar per day, height by session, rest days flat. */
export function WeekRibbon({
  days,
  todayLabel,
  className,
}: {
  days: { label: string; exercises: number }[];
  todayLabel?: string;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const busiest = Math.max(...days.map((day) => day.exercises), 1);

  return (
    <div className={cn("flex items-end justify-between gap-1.5", className)}>
      {days.map((day, index) => {
        const isRest = day.exercises === 0;
        const height = isRest ? 6 : 14 + (day.exercises / busiest) * 32;
        const isToday = day.label === todayLabel;

        return (
          <div
            key={day.label}
            className="flex min-w-0 flex-1 flex-col items-center gap-1.5"
          >
            <motion.span
              initial={reduceMotion ? false : { height: 6, opacity: 0 }}
              animate={{ height, opacity: 1 }}
              transition={{
                duration: 0.45,
                delay: reduceMotion ? 0 : index * 0.05,
                ease: [0.2, 0.7, 0.2, 1],
              }}
              className={cn(
                "w-full max-w-3.5 rounded-full",
                isRest
                  ? "bg-line-strong"
                  : isToday
                    ? "bg-accent-edge"
                    : "bg-accent-deep",
              )}
            />
            <span
              className={cn(
                "font-brand-mono text-[10px] leading-none",
                isToday ? "text-ink" : "text-ink-subtle",
              )}
            >
              {day.label[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}
