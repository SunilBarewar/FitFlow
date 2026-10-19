"use client";

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
import { AccountMark, ExitMark, HomeMark, RestartMark } from "./ui/glyphs";

export type WorkspaceView = "coach" | "plan";

/** Spelled out, because a reset takes everything with it. */
const RESET_ERASES = [
  "Your current plan and every workout in it",
  "All logged sets, reps, and progress",
  "The whole chat history with your coach",
];

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
  const wasResetting = useRef(false);
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

  /** Hold the dialog open through the reset, then dismiss it once it lands. */
  useEffect(() => {
    if (startNewChatPending) {
      wasResetting.current = true;
    } else if (wasResetting.current) {
      wasResetting.current = false;
      setConfirmOpen(false);
    }
  }, [startNewChatPending]);

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
              <RestartMark size={17} /> Reset session
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
              <ExitMark size={17} /> Log out
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

          <div className="flex shrink-0 items-center gap-2">
            {showViewSwitch ? (
              <Link
                href="/home"
                aria-label="Today's workout"
                className="flex h-10 items-center gap-1.5 rounded-full border border-line bg-surface px-3.5 text-[13px] font-semibold text-ink-soft transition-colors hover:bg-sunken"
              >
                <HomeMark size={16} />
                <span className="hidden sm:inline">Home</span>
              </Link>
            ) : null}

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
              <AccountMark size={18} />
            </button>
          </div>
        </div>
        {menu}
      </header>

      <Dialog
        open={confirmOpen}
        onOpenChange={(next) => {
          if (startNewChatPending) return;
          setConfirmOpen(next);
        }}
      >
        <DialogCenterContent title="Reset this session?">
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">
            You start over with a fresh coach. Resetting erases:
          </p>

          <ul className="mt-3.5 flex flex-col gap-2 rounded-2xl border border-line bg-sunken/60 p-3.5">
            {RESET_ERASES.map((item) => (
              <li
                key={item}
                className="flex items-start gap-2.5 text-[13.5px] font-medium"
              >
                <span
                  aria-hidden
                  className="mt-[7px] size-1.5 shrink-0 rounded-full bg-danger"
                />
                {item}
              </li>
            ))}
          </ul>

          <p className="mt-3 text-[12.5px] leading-relaxed text-ink-soft">
            Your account and sign-in stay as they are. Nothing else can be
            recovered — there is no undo.
          </p>

          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              disabled={startNewChatPending}
              className="flex h-11 w-full items-center justify-center rounded-full bg-danger px-4 text-[14px] font-semibold text-white transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-50"
              onClick={onStartNewChat}
            >
              {startNewChatPending ? "Resetting…" : "Reset session"}
            </button>
            <DialogClose
              disabled={startNewChatPending}
              className="flex h-11 w-full items-center justify-center rounded-full border border-line bg-surface px-4 text-[14px] font-semibold text-ink-soft transition-colors hover:bg-sunken disabled:pointer-events-none disabled:opacity-50"
            >
              Keep this session
            </DialogClose>
          </div>
        </DialogCenterContent>
      </Dialog>
    </>
  );
}
