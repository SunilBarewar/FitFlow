"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogCenterContent,
  DialogClose,
} from "@/components/ui/dialog";
import type { ChatBlock, GentleExercise } from "@/features/chat/types";
import { ExerciseThumbnail } from "@/features/workout/components/exercise-thumbnail";
import { exerciseImageUrl } from "@/lib/exercises/image-url";
import { cn } from "@/lib/utils/cn";
import { BlockCard } from "../ui/controls";
import { CautionMark, InfoMark, PulseMark } from "../ui/glyphs";

type SafetyNoticeBlock = Extract<ChatBlock, { type: "safety_notice" }>;
type GentleRoutineBlock = Extract<ChatBlock, { type: "gentle_routine" }>;

/* Safety speaks in a different voice from the rest of the thread:
   warmer paper, a clear icon, and no cheerful colour. */

export function SafetyNoticeBlock({
  block,
  resolved,
  onAcknowledge,
}: {
  block: SafetyNoticeBlock;
  resolved: boolean;
  onAcknowledge: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="w-full max-w-md overflow-hidden rounded-[22px] border border-peach-edge bg-peach-tint"
    >
      <div className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-peach-ink">
          <CautionMark size={18} />
        </span>
        <p className="pt-1 text-[14px] leading-relaxed text-pretty text-ink-soft">
          {block.body}
        </p>
      </div>
      {resolved ? null : (
        <div className="border-t border-peach-edge/70 p-3">
          <motion.button
            type="button"
            onClick={onAcknowledge}
            whileTap={{ scale: 0.98 }}
            className="h-10 w-full rounded-full bg-ink text-[13px] font-semibold text-white transition-colors hover:bg-ink-soft"
          >
            {block.acknowledgeLabel}
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}

/* A comfort routine is read, not skimmed: a big frame of the movement, its
   name, how much of it, and the coach's line on how it should feel — all
   visible at once, nothing hidden behind a chevron. The step-by-step is the
   one thing that would bury the card, so it lives behind the info mark. */
export function GentleRoutineBlock({ block }: { block: GentleRoutineBlock }) {
  return (
    <BlockCard className="max-w-lg">
      <ul className="divide-y divide-line">
        {block.exercises.map((exercise, index) => (
          <GentleExerciseRow
            key={exercise.id ?? exercise.name}
            exercise={exercise}
            index={index}
          />
        ))}
      </ul>

      <p className="border-t border-line px-4 py-3 text-[12px] leading-relaxed text-ink-muted">
        Stop if anything increases pain, causes numbness, or feels wrong. A
        qualified clinician can help assess the cause.
      </p>
    </BlockCard>
  );
}

/** The dose, written the way it is counted: "2 × 8–10 reps". */
function doseLabel(exercise: GentleExercise): string | null {
  if (exercise.sets && exercise.dose) {
    return `${exercise.sets} × ${exercise.dose}`;
  }
  return exercise.dose ?? (exercise.sets ? `${exercise.sets} sets` : null);
}

function GentleExerciseRow({
  exercise,
  index,
}: {
  exercise: GentleExercise;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const dose = doseLabel(exercise);

  return (
    <motion.li
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: index * 0.05 }}
      className="flex items-start gap-3.5 p-4"
    >
      <ExerciseThumbnail exercise={exercise} size={92} />

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <h4 className="min-w-0 flex-1 text-[15px] leading-snug font-semibold tracking-[-0.01em] text-ink">
            <span className="pr-1.5 font-brand-mono text-[12px] text-ink-subtle tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            {exercise.name}
          </h4>

          <motion.button
            type="button"
            onClick={() => setOpen(true)}
            whileTap={{ scale: 0.92 }}
            aria-label={`How to do ${exercise.name}`}
            className="-mt-1 -mr-1 flex size-8 shrink-0 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-sunken hover:text-ink"
          >
            <InfoMark size={16} />
          </motion.button>
        </div>

        {dose ? (
          <p className="pt-1 font-brand-mono text-[12px] text-ink-muted tabular-nums">
            {dose}
          </p>
        ) : null}

        <p className="pt-1.5 text-[13px] leading-relaxed text-pretty text-ink-muted">
          {exercise.detail}
        </p>
      </div>

      <HowToDialog
        exercise={exercise}
        dose={dose}
        open={open}
        onOpenChange={setOpen}
      />
    </motion.li>
  );
}

/* Everything that would have made the row a paragraph: the movement itself,
   the rounds, the steps, and what it works. */
function HowToDialog({
  exercise,
  dose,
  open,
  onOpenChange,
}: {
  exercise: GentleExercise;
  dose: string | null;
  open: boolean;
  onOpenChange: (next: boolean) => void;
}) {
  const steps = exercise.instructions ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogCenterContent
        title={exercise.name}
        description={dose ?? undefined}
        className="max-h-[85vh] max-w-md overflow-y-auto"
      >
        <div className="flex flex-col gap-4 pt-4">
          <MovementFrames images={exercise.images} name={exercise.name} />

          {exercise.sets && exercise.sets > 1 ? (
            <SetRail sets={exercise.sets} dose={exercise.dose} />
          ) : null}

          {steps.length > 0 ? (
            <ol className="flex flex-col gap-2.5">
              {steps.map((step, stepIndex) => (
                <li
                  key={`${exercise.name}-step-${stepIndex}`}
                  className="flex gap-2.5 text-[13px] leading-relaxed text-ink-soft"
                >
                  <span className="pt-px font-brand-mono text-[11px] text-ink-subtle tabular-nums">
                    {String(stepIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="min-w-0 text-pretty">{step}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-[13px] leading-relaxed text-ink-muted">
              No step-by-step on file for this one — ask your coach for form
              cues.
            </p>
          )}

          {exercise.muscles?.length ? (
            <p className="flex flex-wrap gap-1.5 border-t border-line pt-3.5">
              {exercise.muscles.map((muscle) => (
                <span
                  key={muscle}
                  className="rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] text-ink-muted capitalize"
                >
                  {muscle}
                </span>
              ))}
            </p>
          ) : null}

          <DialogClose className="h-11 w-full shrink-0 rounded-full bg-ink text-[13px] font-semibold text-white transition-colors hover:bg-ink-soft">
            Got it
          </DialogClose>
        </div>
      </DialogCenterContent>
    </Dialog>
  );
}

/* One tick per round, in the same language the live session uses. */
function SetRail({ sets, dose }: { sets: number; dose?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {Array.from({ length: sets }, (_, index) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: rounds are positional by definition — set 1, set 2…
          key={index}
          className="flex h-8 items-center gap-1 rounded-xl bg-sunken px-2.5 font-brand-mono text-[11px] text-ink-muted tabular-nums"
        >
          {index + 1}
          {dose ? <span className="text-ink-subtle">· {dose}</span> : null}
        </span>
      ))}
    </div>
  );
}

/* The catalog stores a movement as its two ends. Easing between them shows
   the movement itself, which a still frame can't — slowly, because nothing
   here should flicker. Reduced motion gets both frames, side by side and
   still. */
function MovementFrames({ images, name }: { images?: string[]; name: string }) {
  const reduceMotion = useReducedMotion();
  const frames = images ?? [];
  const [frame, setFrame] = useState(0);
  const animated = frames.length > 1 && !reduceMotion;

  useEffect(() => {
    if (!animated) return;
    const timer = window.setInterval(
      () => setFrame((current) => (current + 1) % frames.length),
      1800,
    );
    return () => window.clearInterval(timer);
  }, [animated, frames.length]);

  if (frames.length === 0) return null;

  if (!animated) {
    return (
      <div className="flex gap-2">
        {frames.slice(0, 2).map((image, index) => (
          <div
            key={image}
            className="relative aspect-[4/3] flex-1 overflow-hidden rounded-2xl border border-line bg-sunken"
          >
            <Image
              src={exerciseImageUrl(image)}
              alt={`${name} — position ${index + 1}`}
              fill
              sizes="220px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-line bg-sunken">
      <AnimatePresence initial={false}>
        <motion.div
          key={frames[frame]}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          className="absolute inset-0"
        >
          <Image
            src={exerciseImageUrl(frames[frame])}
            alt={`${name} — position ${frame + 1}`}
            fill
            sizes="420px"
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      <div className="absolute right-2.5 bottom-2.5 flex gap-1 rounded-full bg-ink/30 px-1.5 py-1 backdrop-blur-sm">
        {frames.map((image, index) => (
          <span
            key={image}
            className={cn(
              "size-1.5 rounded-full transition-colors duration-300",
              index === frame ? "bg-white" : "bg-white/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function UrgentCareBlock() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex w-full max-w-md items-start gap-3 rounded-[22px] border border-danger/25 bg-danger/5 p-4"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface text-danger">
        <PulseMark size={18} />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-[14px] leading-snug font-semibold text-ink">
          Please seek medical care instead of exercising right now.
        </p>
        <p className="pt-1.5 text-[12px] text-ink-muted">
          A qualified clinician can safely assess what&apos;s going on.
        </p>
      </div>
    </motion.div>
  );
}
