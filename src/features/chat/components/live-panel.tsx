"use client";

import { AnimatePresence, motion } from "motion/react";
import type { PanelTab } from "@/features/chat/types";
import type { useChatConversation } from "@/features/chat/use-chat-conversation";
import { PlanTab } from "./panel/plan-tab";
import { TodayCard } from "./panel/today-card";
import { SegmentedSwitch } from "./ui/controls";

/* The workspace half: what you're doing today, and the week it sits in. */
export function LivePanel({
  conversation,
}: {
  conversation: ReturnType<typeof useChatConversation>;
}) {
  const { panel, setPanelTab, todayLog, setExerciseLog } = conversation;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 pt-4 pb-3">
        <SegmentedSwitch<PanelTab>
          layoutId="live-panel-tab"
          value={panel.tab}
          onChange={setPanelTab}
          options={[
            {
              id: "today",
              label: "Today",
              badge: panel.highlightTab === "today",
            },
            { id: "plan", label: "Plan", badge: panel.highlightTab === "plan" },
          ]}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-6">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={panel.tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            {panel.tab === "today" ? (
              <TodayCard
                today={panel.today}
                log={todayLog}
                onSetExerciseLog={setExerciseLog}
              />
            ) : (
              <PlanTab plan={panel.plan} todayLog={todayLog} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
