"use client";

import { LogOut, RotateCcw, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { BrandWordmark } from "@/app/_components/landing/brand-wordmark";
import {
  Dialog,
  DialogCenterContent,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils/cn";
import { SegmentedSwitch } from "./ui/controls";

export type WorkspaceView = "coach" | "plan";

const menuItem =
  "flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-left text-[14px] font-semibold outline-none transition-colors hover:bg-sunken disabled:pointer-events-none disabled:opacity-50";

export function ChatHeader({
  view,
  onViewChange,
  showViewSwitch,
  planBadge,
  onStartNewChat,
  startNewChatPending,
  onSignOut,
  signOutPending,
}: {
  view: WorkspaceView;
  onViewChange: (next: WorkspaceView) => void;
  /** The switch only earns its place once there is a plan to switch to. */
  showViewSwitch: boolean;
  planBadge: boolean;
  onStartNewChat: () => void;
  startNewChatPending?: boolean;
  onSignOut: () => void;
  signOutPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const busy = signOutPending || startNewChatPending;

  const updatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPosition(null);
      return;
    }
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  const menu =
    open && position
      ? createPortal(
          <motion.div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label="Account menu"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            className="fixed z-100 min-w-52 rounded-[20px] border border-line bg-surface p-1.5 shadow-float"
            style={{ top: position.top, right: position.right }}
          >
            <button
              type="button"
              role="menuitem"
              disabled={startNewChatPending}
              className={menuItem}
              onClick={() => {
                setOpen(false);
                setConfirmOpen(true);
              }}
            >
              <RotateCcw size={17} aria-hidden /> Start new plan
            </button>
            <hr className="my-1 h-px border-0 bg-line" />
            <button
              type="button"
              role="menuitem"
              disabled={signOutPending}
              className={cn(menuItem, "text-danger hover:bg-danger/5")}
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
            >
              <LogOut size={17} aria-hidden /> Log out
            </button>
          </motion.div>,
          document.body,
        )
      : null;

  return (
    <>
      <header className="shrink-0 px-3 pt-4 pt-safe sm:px-4 mt-4">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 rounded-full border border-line bg-surface/80 pr-2 pl-4 shadow-card backdrop-blur-xl sm:pl-5">
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="FitFlow home"
          >
            <BrandWordmark size={17} />
          </Link>

          <AnimatePresence>
            {showViewSwitch ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="lg:hidden"
              >
                <SegmentedSwitch<WorkspaceView>
                  layoutId="workspace-view"
                  size="sm"
                  value={view}
                  onChange={onViewChange}
                  options={[
                    { id: "coach", label: "Coach" },
                    { id: "plan", label: "Workout", badge: planBadge },
                  ]}
                />
              </motion.div>
            ) : null}
          </AnimatePresence>

          <button
            ref={triggerRef}
            type="button"
            disabled={busy}
            aria-label="Account menu"
            aria-expanded={open}
            aria-haspopup="menu"
            aria-controls={open ? menuId : undefined}
            onClick={() => setOpen((value) => !value)}
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:bg-sunken disabled:pointer-events-none disabled:opacity-50"
          >
            <User size={18} aria-hidden />
          </button>
        </div>
        {menu}
      </header>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogCenterContent
          title="Start a new plan?"
          description="This permanently deletes your current plan, all workout progress, and your entire chat history. This can't be undone."
        >
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              disabled={startNewChatPending}
              className="flex h-11 w-full items-center justify-center rounded-full bg-danger px-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
              onClick={() => {
                setConfirmOpen(false);
                onStartNewChat();
              }}
            >
              Yes, start new plan
            </button>
            <DialogClose className="flex h-11 w-full items-center justify-center rounded-full border border-line bg-surface px-4 text-[14px] font-semibold text-ink-soft transition-colors hover:bg-sunken">
              Cancel
            </DialogClose>
          </div>
        </DialogCenterContent>
      </Dialog>
    </>
  );
}
