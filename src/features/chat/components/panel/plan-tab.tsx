import { cn } from "cn";
import { CalendarDays, Clock } from "lucide-react";
import type { Plan } from "@/features/chat/types";

export function PlanTab({ plan }: { plan: Plan }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{plan.name}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CalendarDays size={12} aria-hidden /> {plan.daysPerWeek}{" "}
              days/week
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={12} aria-hidden /> {plan.minutesPerSession} min
            </span>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-pill px-2.5 py-1 text-xs font-medium",
            plan.status === "active"
              ? "bg-brand-green-light text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          {plan.status === "active" ? "Active" : "Draft"} · v{plan.version}
        </span>
      </div>

      <ul className="space-y-2.5">
        {plan.days.map((day) => (
          <li key={day.id} className="rounded-xl border border-border p-3">
            <p className="text-xs font-semibold text-muted-foreground">
              {day.label} · {day.focus}
            </p>
            <ul className="mt-1.5 space-y-1">
              {day.exercises.map((exercise) => (
                <li
                  key={exercise.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{exercise.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {exercise.sets} × {exercise.reps}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
