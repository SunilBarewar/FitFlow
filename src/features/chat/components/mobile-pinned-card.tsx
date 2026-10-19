"use client";

import { ChevronRight, Clock } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useLayoutEffect, useState } from "react";
import {
  Dialog,
  DialogSheetContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MOBILE_COACH_PANEL_MEDIA } from "@/features/chat/layout-constants";
import type { PanelTab } from "@/features/chat/types";
import type { useChatConversation } from "@/features/chat/use-chat-conversation";
import { LivePanel } from "./live-panel";

const TAB_LABEL: Record<PanelTab, string> = {
  today: "Today's workout",
  plan: "Your plan",
};

const MOBILE_PANEL_OPEN_KEY = "fitflow:mobile-coach-panel-open";

function readMobilePanelOpen(): boolean {
  try {
    const stored = localStorage.getItem(MOBILE_PANEL_OPEN_KEY);
    if (stored === null) return true;
    return stored === "true";
  } catch {
    return true;
  }
}

function writeMobilePanelOpen(open: boolean) {
  try {
    localStorage.setItem(MOBILE_PANEL_OPEN_KEY, String(open));
  } catch {
    // Ignore quota / private mode — panel still works for this session.
  }
}

export function MobilePinnedCard({
  conversation,
}: {
  conversation: ReturnType<typeof useChatConversation>;
}) {
  const { panel } = conversation;
  const [panelOpen, setPanelOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useLayoutEffect(() => {
    setPanelOpen(readMobilePanelOpen());
  }, []);

  useLayoutEffect(() => {
    const media = window.matchMedia(MOBILE_COACH_PANEL_MEDIA);
    const syncViewport = () => setIsMobileViewport(media.matches);
    syncViewport();
    media.addEventListener("change", syncViewport);
    return () => media.removeEventListener("change", syncViewport);
  }, []);

  const handlePanelOpenChange = useCallback((open: boolean) => {
    setPanelOpen(open);
    writeMobilePanelOpen(open);
  }, []);

  const dialogOpen = panelOpen && isMobileViewport;

  return (
    <Dialog open={dialogOpen} onOpenChange={handlePanelOpenChange}>
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
      <DialogSheetContent title="Your coach dashboard" fullHeight>
        <LivePanel conversation={conversation} />
      </DialogSheetContent>
    </Dialog>
  );
}
