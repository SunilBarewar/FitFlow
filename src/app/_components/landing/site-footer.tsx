import Link from "next/link";
import { BrandWordmark } from "./brand-wordmark";
import { WeekRail } from "./week-rail";

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Questions", href: "#questions" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign in", href: "/sign-in" },
      { label: "Create account", href: "/sign-up" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-canvas">
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <BrandWordmark size={19} />
            <p className="max-w-[22ch] pt-3 text-[14px] leading-relaxed text-ink-muted">
              A training plan that changes when your week does.
            </p>
            <WeekRail className="pt-5" />
          </div>

          {COLUMNS.map((column) => (
            <div key={column.heading}>
              <p className="text-[13px] font-semibold">{column.heading}</p>
              <ul className="flex flex-col gap-2.5 pt-4">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[14px] text-ink-muted transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* The wordmark fades out rather than being outlined: Inter's
            overlapping contours show through a text stroke. */}
        <p
          aria-hidden
          className="mt-14 select-none bg-linear-to-b from-accent-soft/70 via-accent-soft/25 to-transparent bg-clip-text text-[17vw] leading-[0.8] font-semibold tracking-[-0.055em] text-transparent"
        >
          FitFlow
        </p>

        <p className="border-t border-line py-6 text-[13px] text-ink-subtle">
          © {year} FitFlow
        </p>
      </div>
    </footer>
  );
}
