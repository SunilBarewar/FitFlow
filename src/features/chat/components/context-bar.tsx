"use client";

import { cn } from "cn";
import { LogOut, RotateCcw, User } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FitFlowLogo } from "@/components/brand/fitflow-logo";
import { Dialog, DialogCenterContent, DialogClose } from "@/components/ui/dialog";

const menuItemClass =
  "flex min-h-11 w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

export function ContextBar({
  onStartNewChat,
  startNewChatPending,
  onSignOut,
  signOutPending,
}: {
  onStartNewChat: () => void;
  startNewChatPending?: boolean;
  onSignOut: () => void;
  signOutPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    top: number;
    right: number;
  } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const accountBusy = signOutPending || startNewChatPending;

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    setMenuPosition({
      top: rect.bottom + 8,
      right: Math.max(8, window.innerWidth - rect.right),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setMenuPosition(null);
      return;
    }
    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [open, updateMenuPosition]);

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

  function handleStartNewPlanClick() {
    setOpen(false);
    setConfirmOpen(true);
  }

  function handleConfirmStartNewPlan() {
    setConfirmOpen(false);
    onStartNewChat();
  }

  function handleSignOut() {
    setOpen(false);
    onSignOut();
  }

  const menu =
    open && menuPosition
      ? createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            aria-label="Account menu"
            className="fixed z-[100] min-w-48 rounded-xl border border-border bg-card p-1"
            style={{
              top: menuPosition.top,
              right: menuPosition.right,
            }}
          >
            <button
              type="button"
              role="menuitem"
              disabled={startNewChatPending}
              className={menuItemClass}
              onClick={handleStartNewPlanClick}
            >
              <RotateCcw size={18} aria-hidden />
              Start new plan
            </button>
            <div className="my-1 h-px bg-border" role="separator" />
            <button
              type="button"
              role="menuitem"
              disabled={signOutPending}
              className={cn(
                menuItemClass,
                "text-destructive hover:bg-destructive/10",
              )}
              onClick={handleSignOut}
            >
              <LogOut size={18} aria-hidden />
              Log out
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md pt-safe">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="FitFlow home"
          >
            <FitFlowLogo size={36} priority />
          </Link>

          <button
            ref={triggerRef}
            type="button"
            disabled={accountBusy}
            aria-label="Account menu"
            aria-expanded={open}
            aria-haspopup="menu"
            aria-controls={open ? menuId : undefined}
            className={cn(
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors outline-none",
              "hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
            onClick={() => setOpen((value) => !value)}
          >
            <User size={20} aria-hidden />
          </button>
        </div>
        {menu}
      </header>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogCenterContent
          title="Start a new plan?"
          description="This will permanently delete your current plan, all workout progress, and your entire chat history. This action cannot be undone."
        >
          <div className="mt-5 flex flex-col gap-2">
            <button
              type="button"
              disabled={startNewChatPending}
              className="flex h-11 w-full items-center justify-center rounded-xl bg-destructive px-4 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:pointer-events-none disabled:opacity-50"
              onClick={handleConfirmStartNewPlan}
            >
              Yes, start new plan
            </button>
            <DialogClose
              className="flex h-11 w-full items-center justify-center rounded-xl border border-border bg-background px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Cancel
            </DialogClose>
          </div>
        </DialogCenterContent>
      </Dialog>
    </>
  );
}
