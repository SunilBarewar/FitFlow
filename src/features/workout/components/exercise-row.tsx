"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import {
  Caret,
  NoteMark,
  SkipMark,
  SwapMark,
  Tick,
} from "@/features/chat/components/ui/glyphs";
import type { ExerciseLogStatus } from "@/features/chat/types";
import { exerciseImageUrl } from "@/lib/exercises/image-url";
import { cn } from "@/lib/utils/cn";
import type { SessionExercise } from "../types";
import { ExerciseThumbnail } from "./exercise-thumbnail";

/* One exercise, with its detail folded underneath rather than on a second
   screen — there is room for it here, and losing your place mid-session to
   read a form cue is the kind of friction that ends sessions. */

export function ExerciseRow({
  exercise,
  index,
  isCurrent,
  expanded,
  onToggleExpanded,
  onSetStatus,
  onRemove,
  onAskCoach,
}: {
  exercise: SessionExercise;
  index: number;
  isCurrent: boolean;
  expanded: boolean;
  onToggleExpanded: () => void;
  onSetStatus: (status: ExerciseLogStatus, note?: string) => void;
  onRemove: () => void;
  onAskCoach: () => void;
}) {
  const reduceMotion = useReducedMotion();
  const isDone = exercise.status === "done";
  const isSkipped = exercise.status === "skipped";

  return (
    <motion.li
      layout={!reduceMotion}
      initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.22,
        delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.18),
        ease: "easeOut",
        layout: { type: "spring", stiffness: 320, damping: 30 },
      }}
      className={cn(
        "overflow-hidden rounded-2xl border transition-colors",
        isCurrent && !expanded
          ? "border-accent-edge/45 bg-accent-soft/25"
          : "border-line bg-surface",
      )}
    >
      <div className="flex items-center gap-3 p-3">
        <ExerciseThumbnail exercise={exercise} dimmed={isDone || isSkipped} />

        <button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          className="flex min-h-11 min-w-0 flex-1 items-center gap-2 text-left"
        >
          <span className="min-w-0 flex-1">
            <span
              className={cn(
                "block truncate text-[15px] font-semibold",
                isDone && "text-ink-subtle",
                isSkipped && "text-ink-subtle line-through",
              )}
            >
              {exercise.name}
            </span>
            <span className="block truncate text-[12.5px] text-ink-muted">
              {exercise.sets} × {exercise.reps} · {exercise.equipment}
            </span>
            {exercise.note ? (
              <span className="block truncate text-[12.5px] text-accent-edge">
                “{exercise.note}”
              </span>
            ) : null}
            {exercise.origin !== "plan" ? (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-sky-tint px-2 py-0.5 text-[10px] font-semibold text-sky-ink">
                <SwapMark size={10} />
                {exercise.origin === "swapped"
                  ? "Swapped for today"
                  : "Added today"}
              </span>
            ) : null}
          </span>
          <Caret
            size={16}
            className={cn(
              "shrink-0 text-ink-subtle transition-transform",
              expanded && "rotate-180",
            )}
          />
        </button>

        <StatusControl status={exercise.status} onSetStatus={onSetStatus} />
      </div>

      <AnimatePresence initial={false}>
        {expanded ? (
          <motion.div
            key="detail"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <ExerciseDetail
              exercise={exercise}
              onSetStatus={onSetStatus}
              onRemove={onRemove}
              onAskCoach={onAskCoach}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  );
}

/** Done is the common case, so it gets the big target; skip hides in the
 * detail panel where a deliberate tap is appropriate. */
function StatusControl({
  status,
  onSetStatus,
}: {
  status: ExerciseLogStatus;
  onSetStatus: (status: ExerciseLogStatus) => void;
}) {
  const isDone = status === "done";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={() => onSetStatus(isDone ? "pending" : "done")}
      aria-pressed={isDone}
      aria-label={isDone ? "Mark as not done" : "Mark as done"}
      className={cn(
        "flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors",
        isDone
          ? "border-mint-edge bg-mint-tint text-mint-ink"
          : "border-line bg-surface text-ink-subtle hover:border-ink hover:text-ink",
      )}
    >
      <Tick size={16} />
    </motion.button>
  );
}

function ExerciseDetail({
  exercise,
  onSetStatus,
  onRemove,
  onAskCoach,
}: {
  exercise: SessionExercise;
  onSetStatus: (status: ExerciseLogStatus, note?: string) => void;
  onRemove: () => void;
  onAskCoach: () => void;
}) {
  const [noteOpen, setNoteOpen] = useState(Boolean(exercise.note));
  const [noteDraft, setNoteDraft] = useState(exercise.note ?? "");

  return (
    <div className="flex flex-col gap-4 border-t border-line px-3 py-4">
      {exercise.images?.length ? (
        <div className="flex gap-2">
          {exercise.images.slice(0, 2).map((image, index) => (
            <div
              key={image}
              className="relative h-40 flex-1 overflow-hidden rounded-2xl border border-line bg-sunken"
            >
              <Image
                src={exerciseImageUrl(image)}
                alt={`${exercise.name} — step ${index + 1}`}
                fill
                sizes="(min-width: 640px) 300px, 45vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      ) : null}

      <div>
        <p className="font-brand-mono text-[11px] tracking-wide text-ink-subtle uppercase">
          Sets
        </p>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {Array.from({ length: exercise.sets }, (_, index) => (
            <span
              // biome-ignore lint/suspicious/noArrayIndexKey: chips are positional — set 1, set 2…
              key={index}
              className={cn(
                "flex h-8 items-center gap-1 rounded-xl px-2.5 font-brand-mono text-[12px]",
                exercise.status === "done"
                  ? "bg-accent-soft text-ink"
                  : "bg-sunken text-ink-muted",
              )}
            >
              {exercise.status === "done" ? <Tick size={10} /> : null}
              {index + 1} · {exercise.reps}
            </span>
          ))}
        </div>
      </div>

      {exercise.instructions?.length ? (
        <ol className="list-decimal space-y-1.5 pl-4 text-[13px] leading-relaxed text-ink-muted">
          {exercise.instructions.map((step, index) => (
            <li key={`${exercise.id}-step-${index}`}>{step}</li>
          ))}
        </ol>
      ) : (
        <p className="text-[13px] text-ink-muted">
          No step-by-step instructions on file — ask your coach for form cues.
        </p>
      )}

      {noteOpen ? (
        <div>
          <label
            htmlFor={`note-${exercise.id}`}
            className="text-[12px] font-semibold text-ink-muted"
          >
            Note for your coach
          </label>
          <textarea
            id={`note-${exercise.id}`}
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            onBlur={() =>
              onSetStatus(exercise.status, noteDraft.trim() || undefined)
            }
            rows={2}
            placeholder="e.g. did 2 sets of 8 at 20 lb"
            className="mt-1.5 w-full resize-none rounded-2xl border border-line bg-surface px-3 py-2 text-[14px] outline-none transition-colors focus:border-accent-edge"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            onSetStatus(exercise.status === "skipped" ? "pending" : "skipped")
          }
          className={cn(
            "flex h-10 items-center gap-1.5 rounded-full border px-4 text-[13px] font-semibold transition-colors",
            exercise.status === "skipped"
              ? "border-line-strong bg-sunken text-ink"
              : "border-line bg-surface text-ink-soft hover:bg-sunken",
          )}
        >
          <SkipMark size={14} />
          {exercise.status === "skipped" ? "Skipped" : "Skip this one"}
        </button>

        {noteOpen ? null : (
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-sunken"
          >
            <NoteMark size={14} /> Add a note
          </button>
        )}

        <button
          type="button"
          onClick={onAskCoach}
          className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-4 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-sunken"
        >
          <SwapMark size={14} /> Ask for a swap
        </button>

        <button
          type="button"
          onClick={onRemove}
          className="flex h-10 items-center rounded-full px-3 text-[13px] font-semibold text-ink-subtle transition-colors hover:text-danger"
        >
          Remove from today
        </button>
      </div>
    </div>
  );
}
