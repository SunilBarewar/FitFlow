"use client";

import { Heart, Zap } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Concept: “A new beginning”                                         */
/*                                                                     */
/*  Nothing here explains the product. The panel simply makes you      */
/*  feel something: a sunrise, a path that draws itself forward,       */
/*  and a quiet reminder that your goal is worth starting today.       */
/* ------------------------------------------------------------------ */

const AFFIRMATIONS = [
  "One day at a time.",
  "Small steps still move you forward.",
  "You don't need to be perfect — just begin.",
  "The future you is already grateful.",
] as const;

const PATH_D =
  "M28 232 C110 206 96 176 168 168 C236 161 214 128 268 110 C282 105 292 96 300 88";

/** The tip of a flower/grass tuft sways around its base at (x, y). */
function Sway({
  x,
  y,
  delay,
  reduceMotion,
  children,
}: {
  x: number;
  y: number;
  delay: number;
  reduceMotion: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.g
      animate={reduceMotion ? undefined : { rotate: [-2.5, 2.5, -2.5] }}
      transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut", delay }}
      style={{ transformOrigin: `${x}px ${y}px` }}
    >
      {children}
    </motion.g>
  );
}

/**
 * A living morning: the sun rises once, then keeps breathing light.
 * Clouds and mist drift, flowers sway, a butterfly loops the meadow,
 * and a small traveller walks the path toward the sun — forever.
 */
function SunriseIllustration({ reduceMotion }: { reduceMotion: boolean }) {
  const loop = (duration: number, delay = 0) => ({
    duration,
    repeat: Infinity,
    ease: "easeInOut" as const,
    delay,
  });

  return (
    <svg
      viewBox="0 0 420 250"
      role="img"
      aria-label="A sunrise over rolling hills, with a winding path leading toward the sun"
      className="w-full max-w-md"
    >
      {/* Last twinkles of the night, fading as the day arrives */}
      {!reduceMotion &&
        [
          { x: 52, y: 34, delay: 0 },
          { x: 128, y: 58, delay: 1.1 },
          { x: 196, y: 26, delay: 2 },
          { x: 366, y: 44, delay: 0.6 },
        ].map(({ x, y, delay }) => (
          <motion.path
            key={x}
            d="M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8 Z"
            transform={`translate(${x} ${y})`}
            className="fill-white"
            animate={{ opacity: [0.7, 0.1, 0.7], scale: [1, 0.6, 1] }}
            transition={loop(4.5, delay)}
            style={{ transformOrigin: `${x}px ${y}px` }}
          />
        ))}

      {/* Clouds drifting through the morning */}
      {[
        { x: 66, y: 52, s: 1, duration: 16, delay: 0 },
        { x: 330, y: 28, s: 0.7, duration: 20, delay: 1.5 },
      ].map(({ x, y, s, duration, delay }) => (
        <motion.g
          key={x}
          animate={reduceMotion ? undefined : { x: [-10, 16, -10] }}
          transition={loop(duration, delay)}
          className="fill-white/70"
          transform={`translate(${x} ${y}) scale(${s})`}
        >
          <ellipse cx="0" cy="0" rx="26" ry="10" />
          <ellipse cx="-14" cy="4" rx="16" ry="7" />
          <ellipse cx="15" cy="4" rx="18" ry="8" />
        </motion.g>
      ))}

      {/* Sun — simply rises once, then breathes gently. Rays stay still, no rings. */}
      <motion.g
        initial={{ y: reduceMotion ? 0 : 30, opacity: reduceMotion ? 1 : 0.4 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
      >
        <g
          className="stroke-brand-coral/50"
          strokeWidth="3.5"
          strokeLinecap="round"
        >
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
            <line
              key={angle}
              x1="300"
              y1="22"
              x2="300"
              y2="33"
              transform={`rotate(${angle} 300 82)`}
            />
          ))}
        </g>
        <motion.g
          animate={reduceMotion ? undefined : { scale: [1, 1.05, 1] }}
          transition={loop(5)}
          style={{ transformOrigin: "300px 82px" }}
        >
          <circle cx="300" cy="82" r="46" className="fill-brand-coral/25" />
          <circle cx="300" cy="82" r="32" className="fill-brand-coral" />
          <circle cx="289" cy="71" r="9" className="fill-white/25" />
        </motion.g>
      </motion.g>

      {/* Birds heading into the day */}
      <motion.g
        animate={reduceMotion ? undefined : { x: [0, 18, 0], y: [0, -5, 0] }}
        transition={loop(11)}
        className="stroke-foreground/40"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M52 62 q6 -6 12 0 q6 -6 12 0" />
        <path d="M88 42 q5 -5 10 0 q5 -5 10 0" />
        <path d="M118 70 q4 -4 8 0 q4 -4 8 0" />
      </motion.g>

      {/* Hills */}
      <path
        d="M0 190 Q110 150 230 182 T420 176 V250 H0 Z"
        className="fill-primary/15"
      />
      <path
        d="M0 214 Q140 178 260 206 T420 202 V250 H0 Z"
        className="fill-primary/25"
      />

      {/* Morning mist sliding over the hills */}
      {!reduceMotion &&
        [
          { cx: 105, cy: 198, rx: 120, duration: 17, delay: 0 },
          { cx: 318, cy: 208, rx: 100, duration: 21, delay: 2 },
        ].map(({ cx, cy, rx, duration, delay }) => (
          <motion.ellipse
            key={cx}
            cx={cx}
            cy={cy}
            rx={rx}
            ry="13"
            className="fill-white/35"
            style={{ filter: "blur(7px)" }}
            animate={{ x: [-12, 18, -12] }}
            transition={loop(duration, delay)}
          />
        ))}

      {/* Winding path — draws itself in, then rests */}
      <motion.path
        d={PATH_D}
        fill="none"
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="1 14"
        className="stroke-white"
        initial={{ pathLength: reduceMotion ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2.2, ease: "easeOut", delay: 0.3 }}
      />

      {/* A small traveller, forever walking the path (with a soft glow) */}
      {!reduceMotion && (
        <>
          <circle r="11" className="fill-white/45">
            <animateMotion dur="7s" repeatCount="indefinite" path={PATH_D} />
          </circle>
          <circle r="6" className="fill-white stroke-primary" strokeWidth="2.5">
            <animateMotion dur="7s" repeatCount="indefinite" path={PATH_D} />
          </circle>
        </>
      )}

      {/* Milestones along the way — gently pulsing, one after another */}
      {[
        { cx: 96, cy: 194, delay: 0 },
        { cx: 188, cy: 164, delay: 0.9 },
        { cx: 258, cy: 118, delay: 1.8 },
      ].map(({ cx, cy, delay }) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy={cy}
          r="5"
          className="fill-primary"
          animate={
            reduceMotion
              ? undefined
              : { opacity: [0.35, 1, 0.35], r: [4, 6, 4] }
          }
          transition={loop(2.7, delay)}
        />
      ))}

      {/* Meadow flowers, swaying in the breeze */}
      {[
        { x: 54, y: 228, petal: "fill-brand-coral", delay: 0 },
        { x: 122, y: 240, petal: "fill-white", delay: 0.8 },
        { x: 336, y: 232, petal: "fill-white", delay: 1.6 },
        { x: 386, y: 220, petal: "fill-brand-coral", delay: 0.4 },
      ].map(({ x, y, petal, delay }) => (
        <Sway key={x} x={x} y={y} delay={delay} reduceMotion={reduceMotion}>
          <path
            d={`M${x} ${y} Q ${x + 2} ${y - 8} ${x} ${y - 14}`}
            fill="none"
            strokeWidth="1.8"
            className="stroke-primary/60"
          />
          {[0, 90, 180, 270].map((angle) => (
            <circle
              key={angle}
              cx={x + 4.5 * Math.cos((angle * Math.PI) / 180)}
              cy={y - 16 + 4.5 * Math.sin((angle * Math.PI) / 180)}
              r="3"
              className={petal}
            />
          ))}
          <circle cx={x} cy={y - 16} r="2.2" className="fill-chart-5" />
        </Sway>
      ))}

      {/* Grass tufts, swaying alongside */}
      {[
        { x: 84, y: 242, delay: 0.5 },
        { x: 238, y: 236, delay: 1.2 },
        { x: 366, y: 244, delay: 0.2 },
      ].map(({ x, y, delay }) => (
        <Sway key={x} x={x} y={y} delay={delay} reduceMotion={reduceMotion}>
          <g
            fill="none"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="stroke-primary/50"
          >
            <path d={`M${x} ${y} q-2 -10 -6 -14`} />
            <path d={`M${x + 5} ${y} q0 -11 3 -16`} />
            <path d={`M${x + 10} ${y} q2 -9 7 -13`} />
          </g>
        </Sway>
      ))}

      {/* A butterfly looping the meadow, wings fluttering */}
      {!reduceMotion && (
        <motion.g
          animate={{ x: [0, 30, 54, 28, 0], y: [0, -16, -4, -20, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          transform="translate(140 118)"
        >
          {[1, -1].map((side) => (
            <motion.ellipse
              key={side}
              cx={5 * side}
              cy="0"
              rx="6"
              ry="3.6"
              className="fill-brand-coral/80"
              animate={{ scaleX: [1, 0.3, 1] }}
              transition={{
                duration: 0.55,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ transformOrigin: "0px 0px" }}
            />
          ))}
          <line
            x1="0"
            y1="-3"
            x2="0"
            y2="3.5"
            strokeWidth="1.6"
            className="stroke-foreground/60"
          />
        </motion.g>
      )}

      {/* Pollen / light motes drifting upward into the morning */}
      {!reduceMotion &&
        [
          { cx: 70, cy: 120, delay: 0 },
          { cx: 150, cy: 84, delay: 1.4 },
          { cx: 356, cy: 150, delay: 0.7 },
          { cx: 386, cy: 96, delay: 2 },
          { cx: 216, cy: 132, delay: 2.6 },
        ].map(({ cx, cy, delay }) => (
          <motion.circle
            key={cx}
            cx={cx}
            cy={cy}
            r="3"
            className="fill-brand-coral/70"
            animate={{ y: [0, -13, 0], opacity: [0.3, 0.9, 0.3] }}
            transition={loop(4, delay)}
          />
        ))}
    </svg>
  );
}

export function AuthPanel() {
  const reduceMotion = useReducedMotion() ?? false;
  const [affirmation, setAffirmation] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = setInterval(
      () => setAffirmation((i) => (i + 1) % AFFIRMATIONS.length),
      3400,
    );
    return () => clearInterval(timer);
  }, [reduceMotion]);

  return (
    <div className="relative hidden h-full select-none flex-col overflow-hidden bg-brand-green-light text-foreground lg:flex">
      {/* One quiet shape — the background stays exactly as it was */}
      {/* <div
        aria-hidden
        className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-white/40"
      /> */}

      {/* Logo */}
      <header className="relative z-10 mx-auto w-full max-w-xl px-10 pt-8 xl:px-12">
        <Link
          href="/"
          className="flex w-fit items-center gap-2.5"
          aria-label="FitFlow home"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
            <Zap size={16} className="text-primary-foreground" aria-hidden />
          </span>
          <span className="text-lg font-bold tracking-tight">FitFlow.</span>
        </Link>
      </header>

      {/* Feeling, not features */}
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-10 py-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: reduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, ease: "easeOut" }}
          className="max-w-md space-y-4"
        >
          <h2 className="text-4xl font-bold leading-[1.08] tracking-tight xl:text-[2.75rem]">
            A plan made for you.
          </h2>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
            Your goals, your schedule, your equipment — FitFlow brings it all
            together into workouts you can actually follow, week after week.
          </p>
          <p className="text-sm font-medium text-primary">
            Stronger · Healthier · More confident · However you define it
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.6, delay: 0.2 }}
        >
          <SunriseIllustration reduceMotion={reduceMotion} />
        </motion.div>

        {/* A gentle voice that keeps changing its mind about how to cheer you on */}
        <div className="flex min-h-6 items-center gap-2.5" aria-live="polite">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-coral-light">
            <Heart
              size={12}
              className="fill-brand-coral text-brand-coral"
              aria-hidden
            />
          </span>
          <AnimatePresence mode="wait">
            <motion.p
              key={affirmation}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
              transition={{ duration: reduceMotion ? 0 : 0.3 }}
              className="text-sm font-medium"
            >
              {AFFIRMATIONS[affirmation]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Quiet sign-off */}
      <footer className="relative z-10 mx-auto w-full max-w-xl px-10 pb-8 xl:px-12">
        <p className="text-sm text-muted-foreground">
          Made for real life, at your pace.
        </p>
      </footer>
    </div>
  );
}
