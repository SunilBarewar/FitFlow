"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { useChatConversation } from "@/features/chat/use-chat-conversation";
import { cn } from "@/lib/utils/cn";
import type { WorkspaceView } from "./chat-header";
import { ChatPanel } from "./chat-panel";
import { LivePanel } from "./live-panel";

/* Two surfaces, one workspace.
   On a wide screen they sit side by side: the conversation on the
   left, today's workout docked on the right. On a phone there is only
   room for one, so the header's switch slides between them — no
   stacked sheets, no remembered state, one tap either way. */

const SURFACE =
  "flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-[28px] border border-b-0 border-line bg-surface shadow-card";

export function ChatShell({
  conversation,
  view,
  initialDraft,
}: {
  conversation: ReturnType<typeof useChatConversation>;
  view: WorkspaceView;
  initialDraft?: string;
}) {
  const { hasPlan } = conversation;
  const reduceMotion = useReducedMotion();
  const planShowing = hasPlan && view === "plan";

  return (
    <div className="relative mx-auto flex min-h-0 w-full max-w-7xl flex-1 gap-3 px-3 pt-3 sm:px-4 sm:pt-4">
      <section
        aria-label="Conversation with your coach"
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          planShowing && "max-lg:invisible max-lg:pointer-events-none",
        )}
      >
        <div className={SURFACE}>
          <ChatPanel conversation={conversation} initialDraft={initialDraft} />
        </div>
      </section>

      {hasPlan ? (
        <>
          <aside
            aria-label="Today's workout"
            className="hidden min-h-0 w-95 shrink-0 flex-col lg:flex xl:w-105"
          >
            <div className={SURFACE}>
              <LivePanel conversation={conversation} />
            </div>
          </aside>

          <AnimatePresence initial={false}>
            {planShowing ? (
              <motion.section
                key="workout-view"
                aria-label="Today's workout"
                initial={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: reduceMotion ? 0 : 24 }}
                transition={{ duration: 0.22, ease: [0.2, 0.7, 0.2, 1] }}
                className="absolute inset-0 z-10 flex min-h-0 min-w-0 flex-col lg:hidden"
              >
                <div className={SURFACE}>
                  <LivePanel conversation={conversation} />
                </div>
              </motion.section>
            ) : null}
          </AnimatePresence>
        </>
      ) : null}
    </div>
  );
}
