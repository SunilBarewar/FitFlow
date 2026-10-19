import { cn } from "@/lib/utils/cn";

const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

/* ─── The signature motif ───
   Seven dots for seven days: the week as FitFlow sees it — a few
   trained, one live, the rest still open. It recurs in section
   badges and the footer, and nowhere louder than this. */
export function WeekRail({
  done = 2,
  today = 2,
  className,
}: {
  /** How many days read as trained. */
  done?: number;
  /** Index of the live day, or -1 for none. */
  today?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex items-center gap-[5px]", className)}
    >
      {DAYS.map((label, day) => (
        <span
          key={label}
          className={cn(
            "size-[5px] rounded-full",
            day < done
              ? "bg-accent-edge"
              : day === today
                ? "bg-accent-edge/35 ring-1 ring-accent-edge"
                : "bg-line-strong",
          )}
        />
      ))}
    </span>
  );
}
