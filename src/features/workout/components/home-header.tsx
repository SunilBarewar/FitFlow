"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { BrandWordmark } from "@/app/_components/landing/brand-wordmark";
import {
  AccountMark,
  AskMark,
  ExitMark,
} from "@/features/chat/components/ui/glyphs";
import { cn } from "@/lib/utils/cn";

/* The same floating pill the coach wears, with one difference: the loudest
   thing on it is the way back to the coach, because that is the only thing
   this page can't do for you. */

const menuItem =
  "flex min-h-11 w-full cursor-pointer items-center gap-2.5 rounded-xl px-3 text-left text-[14px] font-semibold outline-none transition-colors hover:bg-sunken disabled:pointer-events-none disabled:opacity-50";

export function HomeHeader({
  onSignOut,
  signOutPending,
}: {
  onSignOut: () => void;
  signOutPending: boolean;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

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

  return (
    <header className="mt-4 shrink-0 px-3 pt-4 pt-safe sm:px-4">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 rounded-full border border-line bg-surface/80 pr-2 pl-4 shadow-card backdrop-blur-xl sm:pl-5">
        <Link
          href="/"
          className="flex shrink-0 items-center"
          aria-label="FitFlow home"
        >
          <BrandWordmark size={17} />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/chat"
            className="flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-semibold text-white transition-colors hover:bg-ink-soft"
          >
            <AskMark size={15} />
            Ask coach
          </Link>

          <div className="relative">
            <button
              ref={triggerRef}
              type="button"
              disabled={signOutPending}
              aria-label="Account menu"
              aria-expanded={open}
              aria-haspopup="menu"
              aria-controls={open ? menuId : undefined}
              onClick={() => setOpen((value) => !value)}
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface text-ink-soft transition-colors hover:bg-sunken disabled:pointer-events-none disabled:opacity-50"
            >
              <AccountMark size={18} />
            </button>

            {open ? (
              <motion.div
                ref={menuRef}
                id={menuId}
                role="menu"
                aria-label="Account menu"
                initial={{ opacity: 0, y: -6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute top-12 right-0 z-50 min-w-48 rounded-[20px] border border-line bg-surface p-1.5 shadow-float"
              >
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
              </motion.div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
