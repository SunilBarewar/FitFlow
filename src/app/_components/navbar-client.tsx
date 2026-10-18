"use client";

import { Menu, X } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { FitFlowLogo } from "@/components/brand/fitflow-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
];

export function NavbarClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center">
          <FitFlowLogo size={32} priority />
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ size: "sm" }),
                "rounded-full px-5 font-semibold",
              )}
            >
              Go to dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "rounded-full px-4",
                )}
              >
                Sign in
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "rounded-full px-5 font-semibold",
                )}
              >
                Get started free
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="md:hidden border-t border-border bg-background/95 backdrop-blur-md px-4 py-4 space-y-1"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 flex flex-col gap-2">
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className={cn(
                  buttonVariants(),
                  "rounded-full h-11 w-full font-semibold",
                )}
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "rounded-full h-11 w-full",
                  )}
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className={cn(
                    buttonVariants(),
                    "rounded-full h-11 w-full font-semibold",
                  )}
                >
                  Get started free
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
}
