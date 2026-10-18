"use client";

import { Menu } from "@base-ui/react/menu";
import { LogOut, MessageSquarePlus, User, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "cn";

const menuItemClass =
  "flex min-h-11 cursor-default items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium outline-none select-none data-highlighted:bg-muted data-highlighted:text-foreground";

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
  const menuDisabled = signOutPending || startNewChatPending;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur-md pt-safe">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2"
          aria-label="FitFlow home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Zap size={18} className="text-primary-foreground" aria-hidden />
          </span>
          <span className="text-base font-bold tracking-tight">FitFlow.</span>
        </Link>

        <Menu.Root modal={false}>
          <Menu.Trigger
            disabled={menuDisabled}
            aria-label="Account menu"
            className={cn(
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-foreground transition-colors outline-none",
              "hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            <User size={20} aria-hidden />
          </Menu.Trigger>
          <Menu.Portal>
            <Menu.Positioner side="bottom" align="end" sideOffset={8}>
              <Menu.Popup
                className={cn(
                  "z-50 min-w-48 rounded-xl border border-border bg-card p-1",
                  "origin-(--transform-origin) transition-[transform,scale,opacity] duration-150 ease-out",
                  "data-starting-style:scale-95 data-starting-style:opacity-0",
                  "data-ending-style:scale-95 data-ending-style:opacity-0",
                )}
              >
                <Menu.Item
                  className={menuItemClass}
                  disabled={startNewChatPending}
                  onClick={onStartNewChat}
                >
                  <MessageSquarePlus size={18} aria-hidden />
                  Start new chat
                </Menu.Item>
                <Menu.Separator className="my-1 h-px bg-border" />
                <Menu.Item
                  className={cn(menuItemClass, "text-destructive data-highlighted:bg-destructive/10")}
                  disabled={signOutPending}
                  onClick={onSignOut}
                >
                  <LogOut size={18} aria-hidden />
                  Log out
                </Menu.Item>
              </Menu.Popup>
            </Menu.Positioner>
          </Menu.Portal>
        </Menu.Root>
      </div>
    </header>
  );
}
