"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { BrandWordmark } from "./brand-wordmark";

const NAV_LINKS = [
  { label: "Features", id: "features" },
  { label: "How it works", id: "how-it-works" },
  { label: "Questions", id: "questions" },
];

export function LandingNavClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lifted, setLifted] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  /* The page scrolls inside a container, not the window, so listen on
     the nearest scrollable ancestor for the shadow lift. */
  useEffect(() => {
    const scroller = document.getElementById("landing-scroll");
    if (!scroller) return;
    const onScroll = () => setLifted(scroller.scrollTop > 8);
    onScroll();
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => scroller.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) =>
      document.getElementById(link.id),
    ).filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActive(visible[0]?.target.id ?? null);
      },
      { rootMargin: "-20% 0px -65% 0px" },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <header className="sticky inset-x-0 top-3 z-50 px-4 sm:top-4 sm:px-6">
      <div
        className={cn(
          "mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 rounded-full border border-line bg-surface/75 pr-2 pl-4 backdrop-blur-xl transition-shadow duration-300 sm:pl-5",
          lifted ? "shadow-float" : "shadow-card",
        )}
      >
        <Link href="/" className="flex items-center" aria-label="FitFlow home">
          <BrandWordmark size={17} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className={cn(
                "rounded-full px-3 py-1.5 text-[13px] leading-none font-semibold transition-colors",
                active === link.id
                  ? "bg-accent-soft text-ink"
                  : "text-ink-muted hover:text-ink",
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href={isLoggedIn ? "/home" : "/sign-up"}
            className="hidden h-9 items-center rounded-full bg-ink px-4 text-[13px] leading-none font-semibold text-white transition-colors hover:bg-ink-soft sm:inline-flex"
          >
            {isLoggedIn ? "Open FitFlow" : "Start free"}
          </Link>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex size-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sunken lg:hidden"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="mx-auto mt-2 max-w-3xl rounded-[28px] border border-line bg-surface/95 p-2 shadow-float backdrop-blur-xl lg:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              onClick={() => setMenuOpen(false)}
              className="block rounded-full px-4 py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-sunken hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <Link
            href={isLoggedIn ? "/home" : "/sign-up"}
            onClick={() => setMenuOpen(false)}
            className="mt-1 flex h-11 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white sm:hidden"
          >
            {isLoggedIn ? "Open FitFlow" : "Start free"}
          </Link>
        </div>
      ) : null}
    </header>
  );
}
