"use client";

import type { WorkoutSession } from "../types";

/**
 * One tab, one truth about today's session.
 *
 * /home and /chat are separate routes, so only one of them is ever mounted —
 * but module state outlives a client-side navigation, which makes this the
 * cheapest way for the page being left to hand today's session to the page
 * being opened. Both sides already write to the same store (workout_sessions);
 * this only stops their *views* from disagreeing between reads.
 *
 * A BroadcastChannel carries the same publish to the app's other tabs, so a
 * session adjusted in chat lands in the home page open next to it.
 *
 * Subscribers decide what to do with a session for a date other than the one
 * they are showing — a tab left open across midnight will see one, and only
 * the subscriber knows which date it is on.
 */

const CHANNEL_NAME = "fitflow:workout-session";

type Listener = (session: WorkoutSession | null) => void;

let current: WorkoutSession | null = null;
/** Content of `current`, so an echo can be recognised across a structured clone. */
let currentKey: string | null = null;
const listeners = new Set<Listener>();

let channel: BroadcastChannel | null = null;
let channelReady = false;

function keyOf(session: WorkoutSession | null): string | null {
  return session ? JSON.stringify(session) : null;
}

function getChannel(): BroadcastChannel | null {
  if (channelReady) return channel;
  channelReady = true;
  if (typeof window === "undefined" || !("BroadcastChannel" in window)) {
    return null;
  }
  channel = new BroadcastChannel(CHANNEL_NAME);
  channel.addEventListener("message", (event: MessageEvent) => {
    const session = (event.data as { session: WorkoutSession | null } | null)
      ?.session;
    accept(session ?? null, false);
  });
  return channel;
}

/** Applies a session locally and fans it out. `broadcast` is false for one
 * that just arrived from another tab — otherwise two tabs echo forever. */
function accept(session: WorkoutSession | null, broadcast: boolean): void {
  const key = keyOf(session);
  if (key === currentKey) return;

  current = session;
  currentKey = key;
  for (const listener of listeners) listener(session);
  if (broadcast) getChannel()?.postMessage({ session });
}

/** Announce today's session after any read or write that produced it. */
export function publishSession(session: WorkoutSession): void {
  accept(session, true);
}

/** Today's session no longer exists (the plan was torn down). */
export function clearSyncedSession(): void {
  accept(null, true);
}

/** The freshest session this tab has seen, or null before the first publish. */
export function getSyncedSession(): WorkoutSession | null {
  return current;
}

export function subscribeToSession(listener: Listener): () => void {
  listeners.add(listener);
  getChannel();
  return () => {
    listeners.delete(listener);
  };
}
