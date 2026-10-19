import "server-only";
import { getSessionFromCookies } from "@/lib/auth/session";
import { isDateKey, isWithinServerDayWindow } from "@/lib/date/today";

/** Every workout route starts the same way: who is this, and is the date sane? */
export async function requireUser(): Promise<string | null> {
  const session = await getSessionFromCookies();
  return session?.sub ?? null;
}

/** The client owns "today", but not the right to write arbitrary history. */
export function isUsableDate(date: unknown): date is string {
  return isDateKey(date) && isWithinServerDayWindow(date);
}

/** Thrown when today's session is already marked complete — logs are final. */
export class SessionImmutableError extends Error {
  constructor(
    message = "Today's session is complete and can't be changed.",
  ) {
    super(message);
    this.name = "SessionImmutableError";
  }
}
