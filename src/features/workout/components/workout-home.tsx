"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { toast } from "@/components/ui/fit-toaster";
import { RestMark } from "@/features/chat/components/ui/glyphs";
import type { ExerciseLogStatus, Plan } from "@/features/chat/types";
import {
  useWorkoutSession,
  type WorkoutHomeData,
} from "../use-workout-session";
import { AdjustDialog } from "./adjust-dialog";
import { ExerciseRow } from "./exercise-row";
import { PlanWeek } from "./plan-week";
import { SessionHero } from "./session-hero";
import { WeekStrip } from "./week-strip";

/* The page body. Today's session leads; the week and the plan sit beside it
   on a wide screen and underneath it on a phone. */

export function WorkoutHome({
  initial,
  plan,
}: {
  initial: WorkoutHomeData;
  plan: Plan;
}) {
  const router = useRouter();
  const onSessionError = useCallback((message: string) => {
    toast.error(message);
  }, []);
  const {
    session,
    week,
    pendingAction,
    setExerciseStatus,
    setSessionStatus,
    adjustSession,
    resetToPlan,
  } = useWorkoutSession(initial, onSessionError);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const doneCount = useMemo(
    () =>
      session.exercises.filter((exercise) => exercise.status === "done").length,
    [session.exercises],
  );

  const nextExercise = session.exercises.find(
    (exercise) => exercise.status === "pending",
  );

  const sessionLocked = session.status === "completed";

  function askCoach(prompt: string) {
    router.push(`/chat?prefill=${encodeURIComponent(prompt)}`);
  }

  function logExercise(
    exerciseId: string,
    status: ExerciseLogStatus,
    note?: string,
  ) {
    void setExerciseStatus(exerciseId, status, note).then((completed) => {
      if (completed) {
        toast.success("Session complete", {
          description: "Logged for today. Recovery starts now.",
        });
      }
    });
    // Collapse once logged — the next exercise is what matters now.
    if (status === "done" && expandedId === exerciseId) setExpandedId(null);
  }

  async function skipDay() {
    const ok = await setSessionStatus("skipped");
    if (ok) {
      setAdjustOpen(false);
      toast.info("Today marked as skipped", {
        description: "Rest is part of the plan. Back at it tomorrow.",
      });
    }
  }

  async function restorePlan() {
    const ok = await resetToPlan();
    if (ok) {
      toast.info("Planned session restored");
    }
  }

  const isRest = session.status === "rest" || session.exercises.length === 0;

  return (
    <div className="mx-auto w-full max-w-5xl px-3 pt-4 pb-16 sm:px-4 lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:pb-4">
      <div className="flex flex-col gap-3 lg:min-h-0 lg:flex-1 lg:grid lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-4 lg:overflow-hidden">
        <div className="flex flex-col gap-3 lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain lg:pb-4 lg:scrollbar-none">
          <SessionHero
            session={session}
            doneCount={doneCount}
            nextExercise={nextExercise}
            onStart={() => setExpandedId(nextExercise ? nextExercise.id : null)}
            onOpenAdjust={() => setAdjustOpen(true)}
            onResetToPlan={() => void restorePlan()}
            pendingAction={pendingAction}
          />

          {isRest ? (
            <RestDayCard
              onAskCoach={() =>
                askCoach(
                  "Today is a rest day but I'd like to do something light. What do you suggest?",
                )
              }
            />
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {session.exercises.map((exercise, index) => (
                  <ExerciseRow
                    key={exercise.id}
                    exercise={exercise}
                    index={index}
                    locked={sessionLocked}
                    isCurrent={exercise.id === nextExercise?.id}
                    expanded={expandedId === exercise.id}
                    onToggleExpanded={() =>
                      setExpandedId(
                        expandedId === exercise.id ? null : exercise.id,
                      )
                    }
                    onSetStatus={(status, note) =>
                      logExercise(exercise.id, status, note)
                    }
                    onRemove={() =>
                      void adjustSession({
                        reason: `Dropped ${exercise.name}`,
                        remove: [exercise.id],
                      })
                    }
                    onAskCoach={() =>
                      askCoach(
                        `Can you swap ${exercise.name} for something else in today's session?`,
                      )
                    }
                  />
                ))}
              </ul>
              <p className="px-1 text-[12px] leading-relaxed text-ink-subtle">
                Tap an exercise for form cues, or the circle to mark it done.
              </p>
            </>
          )}
        </div>

        <aside className="flex flex-col gap-3 lg:min-h-0 lg:overflow-y-auto lg:overscroll-y-contain lg:pb-4 lg:pl-1">
          <WeekStrip week={week} />
          <PlanWeek
            plan={plan}
            todayLabel={session.dayLabel}
            onAskCoach={() => askCoach("I'd like to change my weekly plan.")}
          />
        </aside>
      </div>

      {/* Keyed on what the dialog seeds its fields from, so a reset or an
          adjustment made elsewhere doesn't leave stale values behind. */}
      <AdjustDialog
        key={`adjust-${session.targetMinutes}-${session.exercises.length}`}
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        session={session}
        onApply={adjustSession}
        onSkipDay={() => void skipDay()}
        onAskCoach={() =>
          askCoach("I need to change today's session — here's what's going on:")
        }
        pending={pendingAction === "adjust"}
      />
    </div>
  );
}

function RestDayCard({ onAskCoach }: { onAskCoach: () => void }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-[22px] border border-dashed border-line-strong px-5 py-12 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-sky-tint text-sky-ink">
        <RestMark size={22} />
      </span>
      <p className="pt-1 text-[15px] font-semibold">Nothing planned today</p>
      <p className="max-w-64 text-[13px] leading-relaxed text-ink-muted">
        Rest is where the work sticks. If you&apos;d rather move anyway, your
        coach can put together something light.
      </p>
      <button
        type="button"
        onClick={onAskCoach}
        className="mt-2 flex h-11 items-center rounded-full border border-line bg-surface px-5 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-sunken"
      >
        Ask for a light session
      </button>
    </div>
  );
}
