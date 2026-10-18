"use client";

import { AnimatePresence, motion } from "motion/react";
import {
  Tabs,
  TabsIndicator,
  TabsList,
  TabsPanel,
  TabsTab,
} from "@/components/ui/tabs";
import type { PanelTab } from "@/features/chat/types";
import type { useChatConversation } from "@/features/chat/use-chat-conversation";
import { PlanTab } from "./panel/plan-tab";
import { TodayCard } from "./panel/today-card";

const TABS: { id: PanelTab; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "plan", label: "Plan" },
];

export function LivePanel({
  conversation,
}: {
  conversation: ReturnType<typeof useChatConversation>;
}) {
  const { panel, setPanelTab, todayLog, setExerciseLog } = conversation;

  return (
    <Tabs
      value={panel.tab}
      onValueChange={(v) => setPanelTab(v as PanelTab)}
      className="flex h-full flex-col"
    >
      <div className="border-b border-border px-4 py-3 sm:px-5">
        <TabsList>
          <TabsIndicator />
          {TABS.map((tab) => (
            <TabsTab key={tab.id} value={tab.id} className="relative">
              {tab.label}
              <AnimatePresence>
                {panel.highlightTab === tab.id ? (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute -top-0.5 -right-1 h-2 w-2 rounded-full bg-accent"
                  />
                ) : null}
              </AnimatePresence>
            </TabsTab>
          ))}
        </TabsList>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
        <TabsPanel value="today">
          <AnimatedPanelContent active={panel.tab === "today"}>
            <TodayCard
              today={panel.today}
              log={todayLog}
              onSetExerciseLog={setExerciseLog}
            />
          </AnimatedPanelContent>
        </TabsPanel>
        <TabsPanel value="plan">
          <AnimatedPanelContent active={panel.tab === "plan"}>
            <PlanTab plan={panel.plan} todayLog={todayLog} />
          </AnimatedPanelContent>
        </TabsPanel>
      </div>
    </Tabs>
  );
}

function AnimatedPanelContent({
  active,
  children,
}: {
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={false}
      animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
