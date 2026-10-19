"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ExerciseLogStatus } from "@/features/chat/types";
import { getTodayRef } from "@/lib/date/today";
import type {
  SessionAdjustmentPatch,
  SessionStatus,
  WeekDaySummary,
  WorkoutSession,
} from "./types";

export type WorkoutHomeData = {
  session: WorkoutSession;
  week: WeekDaySummary[];
};

type Failure = (message: string) => void;

/**
 * Everything the home page can do to today's session.
 *
 * Writes are optimistic — a tap lands instantly and rolls back if the server
 * disagrees — because logging happens mid-set, with a sweaty thumb, on hotel
 * wifi. The one rule the client shares with the server is how a session's
 * status falls out of its exercises except completion — that requires Finish;
 * see deriveSessionStatus in the store.
 */
export function useWorkoutSession(initial: WorkoutHomeData, onError: Failure) {
  const [session, setSession] = useState(initial.session);
  const [week, setWeek] = useState(initial.week);
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  /** Serialized per exercise so a fast double-tap can't land out of order. */
  const queues = useRef(new Map<string, Promise<unknown>>());
  const latest = useRef(initial.session);
  latest.current = session;

  const refreshInFlight = useRef(false);
  const refresh = useCallback(async () => {
    if (refreshInFlight.current) return;
    refreshInFlight.current = true;
    const { date, dayLabel } = getTodayRef();
    try {
      const response = await fetch(
        `/api/workout/today?date=${date}&dayLabel=${encodeURIComponent(dayLabel)}`,
      );
      if (!response.ok) return;
      const data = (await response.json()) as WorkoutHomeData;
      setSession((prev) =>
        sessionSnapshot(prev) === sessionSnapshot(data.session)
          ? prev
          : data.session,
      );
      setWeek((prev) =>
        weekSnapshot(prev) === weekSnapshot(data.week) ? prev : data.week,
      );
    } catch {
      // A stale view is better than an error toast the user can't act on.
    } finally {
      refreshInFlight.current = false;
    }
  }, []);

  // The coach can change today's session from /chat while this page is open.
  // Re-read only after the tab was actually hidden — not on window focus noise
  // (devtools, dialogs, dev HMR) which was spamming /api/workout/today.
  const lastRefresh = useRef(0);
  useEffect(() => {
    let tabWasHidden = document.visibilityState === "hidden";

    function onVisibilityChange() {
      if (document.visibilityState === "hidden") {
        tabWasHidden = true;
        return;
      }
      if (!tabWasHidden) return;
      tabWasHidden = false;
      if (Date.now() - lastRefresh.current < 30_000) return;
      lastRefresh.current = Date.now();
      void refresh();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [refresh]);

  const setExerciseStatus = useCallback(
    (exerciseId: string, status: ExerciseLogStatus, note?: string) => {
      if (latest.current.status === "completed") {
        onError("Today's session is complete and can't be changed.");
        return Promise.resolve();
      }

      const rollback = latest.current;

      setSession((prev) => {
        const exercises = prev.exercises.map((exercise) =>
          exercise.id === exerciseId
            ? { ...exercise, status, note: note ?? undefined }
            : exercise,
        );
        return {
          ...prev,
          exercises,
          status: statusFrom(exercises, prev.status),
        };
      });

      const run = async () => {
        try {
          const response = await fetch("/api/workout/today/exercise", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              date: rollback.date,
              exerciseId,
              status,
              note,
            }),
          });
          if (response.status === 409) {
            throw new Error("immutable");
          }
          if (!response.ok) throw new Error("save failed");
          const data = (await response.json()) as { session: WorkoutSession };
          setSession(data.session);
        } catch (error) {
          setSession(rollback);
          onError(
            error instanceof Error && error.message === "immutable"
              ? "Today's session is complete and can't be changed."
              : "That didn't save. Your progress is safe — try again.",
          );
        }
      };

      const queue = (queues.current.get(exerciseId) ?? Promise.resolve()).then(
        run,
      );
      queues.current.set(exerciseId, queue);
      return queue;
    },
    [onError],
  );

  /** Shared by the server-backed actions that aren't per-exercise. */
  const post = useCallback(
    async (
      action: string,
      url: string,
      method: "PATCH" | "POST",
      body: Record<string, unknown>,
      failure: string,
    ) => {
      if (
        latest.current.status === "completed" &&
        action !== "status:completed"
      ) {
        onError("Today's session is complete and can't be changed.");
        return false;
      }

      setPendingAction(action);
      try {
        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: latest.current.date, ...body }),
        });
        if (response.status === 409) {
          onError("Today's session is complete and can't be changed.");
          return false;
        }
        if (!response.ok) throw new Error(failure);
        const data = (await response.json()) as { session: WorkoutSession };
        setSession(data.session);
        void refreshWeek(setWeek, latest.current.date);
        return true;
      } catch {
        onError(failure);
        return false;
      } finally {
        setPendingAction(null);
      }
    },
    [onError],
  );

  const setSessionStatus = useCallback(
    (status: SessionStatus) =>
      post(
        `status:${status}`,
        "/api/workout/today/status",
        "PATCH",
        { status },
        "Couldn't update the session. Try again.",
      ),
    [post],
  );

  const adjustSession = useCallback(
    (patch: SessionAdjustmentPatch) =>
      post(
        "adjust",
        "/api/workout/today/adjust",
        "PATCH",
        patch,
        "Couldn't adjust today's session. Try again.",
      ),
    [post],
  );

  const resetToPlan = useCallback(
    () =>
      post(
        "reset",
        "/api/workout/today/reset",
        "POST",
        { dayLabel: latest.current.dayLabel },
        "Couldn't restore the planned session. Try again.",
      ),
    [post],
  );

  return {
    session,
    week,
    pendingAction,
    setExerciseStatus,
    setSessionStatus,
    adjustSession,
    resetToPlan,
    refresh,
  };
}

/** Mirrors deriveSessionStatus on the server so the optimistic view matches
 * what the write will produce. */
function statusFrom(
  exercises: { status: ExerciseLogStatus }[],
  current: SessionStatus,
): SessionStatus {
  if (exercises.length === 0) return "rest";
  const logged = exercises.filter((item) => item.status !== "pending").length;
  if (logged === 0) return current === "skipped" ? "skipped" : "not_started";
  if (current === "completed") return "completed";
  return "in_progress";
}

function sessionSnapshot(session: WorkoutSession): string {
  return JSON.stringify({
    id: session.id,
    status: session.status,
    exercises: session.exercises.map((exercise) => ({
      id: exercise.id,
      status: exercise.status,
      note: exercise.note ?? null,
    })),
    adjustment: session.adjustment?.adjustedAt ?? null,
    targetMinutes: session.targetMinutes,
  });
}

function weekSnapshot(week: WeekDaySummary[]): string {
  return JSON.stringify(
    week.map((day) => ({ date: day.date, status: day.status })),
  );
}

async function refreshWeek(
  setWeek: (week: WeekDaySummary[]) => void,
  date: string,
) {
  try {
    const response = await fetch(`/api/workout/week?date=${date}`);
    if (!response.ok) return;
    const data = (await response.json()) as { week: WeekDaySummary[] };
    setWeek(data.week);
  } catch {
    // The strip is context, not the task — a stale one is harmless.
  }
}
