import { cn } from "cn";
import { Flame, Trophy } from "lucide-react";
import { motion } from "motion/react";
import type { ProgressStats } from "@/features/chat/types";

export function ProgressTab({ progress }: { progress: ProgressStats }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          icon={<Flame size={15} className="text-accent" aria-hidden />}
          label="Current streak"
          value={`${progress.streakDays} days`}
        />
        <StatCard
          icon={<Trophy size={15} className="text-primary" aria-hidden />}
          label="Total workouts"
          value={String(progress.totalWorkouts)}
        />
      </div>

      <div className="rounded-xl border border-border p-3">
        <div className="flex items-center justify-between text-xs">
          <p className="font-semibold text-foreground">This week</p>
          <p className="text-muted-foreground">
            {progress.weeklyCompleted}/{progress.weeklyTarget} workouts
          </p>
        </div>
        <div className="mt-3 flex items-end justify-between gap-1.5">
          {progress.recentSessions.map((session, index) => (
            <div
              key={session.label}
              className="flex flex-1 flex-col items-center gap-1.5"
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: session.completed ? 36 : 14 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.04,
                  ease: "easeOut",
                }}
                className={cn(
                  "w-full rounded-md",
                  session.completed ? "bg-primary" : "bg-muted",
                )}
              />
              <span className="text-[11px] text-muted-foreground">
                {session.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
