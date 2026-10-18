"use client";

import { ChevronRight, Clock } from "lucide-react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogSheetContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { PanelTab } from "@/features/chat/types";
import type { useChatConversation } from "@/features/chat/use-chat-conversation";
import { LivePanel } from "./live-panel";

const TAB_LABEL: Record<PanelTab, string> = {
  today: "Today's workout",
  plan: "Your plan",
};

export function MobilePinnedCard({
  conversation,
}: {
  conversation: ReturnType<typeof useChatConversation>;
}) {
  const { panel } = conversation;

  return (
    <Dialog>
      <DialogTrigger
        className="block w-full border-b border-border px-4 py-3 text-left transition-colors active:bg-muted sm:px-6"
        aria-label={`View ${TAB_LABEL[panel.tab].toLowerCase()}`}
      >
        <motion.div
          key={panel.tab}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-between gap-3"
        >
          <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">
              {TAB_LABEL[panel.tab]}
            </p>
            {panel.tab === "today" ? (
              panel.today ? (
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  <Clock size={13} aria-hidden className="text-primary" />
                  {panel.today.dayLabel} · {panel.today.focus} ·{" "}
                  {panel.today.minutes} min
                </p>
              ) : (
                <p className="text-sm font-semibold">No workout planned yet</p>
              )
            ) : (
              <p className="truncate text-sm font-semibold">
                {panel.plan?.name ?? "No plan yet"}
              </p>
            )}
          </div>
          <ChevronRight
            size={18}
            className="shrink-0 text-muted-foreground"
            aria-hidden
          />
        </motion.div>
      </DialogTrigger>
      <DialogSheetContent title="Your coach dashboard">
        <LivePanel conversation={conversation} />
      </DialogSheetContent>
    </Dialog>
  );
}
