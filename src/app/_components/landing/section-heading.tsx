import { cn } from "@/lib/utils/cn";
import { WeekRail } from "./week-rail";

/* Badge, h2, and at most two lines of description. */
export function SectionHeading({
  badge,
  title,
  description,
  align = "center",
  className,
}: {
  badge: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "start";
  className?: string;
}) {
  const centred = align === "center";

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        centred ? "mx-auto max-w-2xl items-center text-center" : "items-start",
        className,
      )}
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1 text-[13px] font-medium text-ink-soft shadow-card">
        <WeekRail />
        {badge}
      </span>
      <h2 className="text-[36px] leading-[1.1] font-medium tracking-[-0.025em] text-balance sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-2xl text-[17px] leading-relaxed text-pretty text-ink-muted">
          {description}
        </p>
      ) : null}
    </div>
  );
}
