/**
 * The client owns "what day is it" — it reads the browser's clock and sends
 * (date, dayLabel) to the server with every session read and write.
 *
 * Both halves must come from the *same* clock reading in the *same* timezone.
 * Mixing a UTC date with a local weekday produces pairs that never reoccur,
 * which silently orphans a day's log.
 */

/** Local calendar date as YYYY-MM-DD. en-CA formats exactly that way. */
export function toDateKey(date: Date): string {
  return date.toLocaleDateString("en-CA");
}

/** Local weekday name, e.g. "Monday". */
export function toDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "long" });
}

export type DayRef = { date: string; dayLabel: string };

/** Today, as the running environment sees it. */
export function getTodayRef(now: Date = new Date()): DayRef {
  return { date: toDateKey(now), dayLabel: toDayLabel(now) };
}

/** Parse a YYYY-MM-DD key back into a local Date at midnight. */
export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function isDateKey(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

/** Monday-first week containing `key`, as seven date keys. */
export function weekDateKeys(key: string): string[] {
  const start = fromDateKey(key);
  // getDay() is Sunday-first (0 = Sun); shift so the week starts on Monday.
  start.setDate(
    start.getDate() + (start.getDay() === 0 ? -6 : 1 - start.getDay()),
  );
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    return toDateKey(day);
  });
}

/**
 * Guards a client-supplied date against a write to arbitrary history.
 * One day either side of the server's own date covers every real timezone
 * offset without needing a stored timezone per user.
 */
export function isWithinServerDayWindow(
  key: string,
  now: Date = new Date(),
): boolean {
  const target = fromDateKey(key).getTime();
  const today = fromDateKey(toDateKey(now)).getTime();
  return Math.abs(target - today) <= 36 * 60 * 60 * 1000;
}
