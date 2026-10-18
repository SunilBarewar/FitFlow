"use client";

import { cn } from "cn";
import type { BodyRegion } from "@/features/chat/setup-options";

const QUIET = "fill-muted-foreground/35";

function regionClass(active: boolean) {
  return cn(
    "transition-colors duration-200 motion-reduce:transition-none",
    active ? "fill-primary" : "fill-muted-foreground/20",
  );
}

export function BodyFigure({ regions }: { regions: ReadonlySet<BodyRegion> }) {
  const on = (region: BodyRegion) => regionClass(regions.has(region));

  return (
    <svg
      viewBox="0 0 140 300"
      aria-hidden
      className="h-auto w-20 shrink-0 sm:w-24"
    >
      <title>Highlighted training areas</title>
      <circle cx="70" cy="24" r="16" className={QUIET} />
      <rect
        x="63"
        y="40"
        width="14"
        height="12"
        rx="4"
        className={on("neck")}
      />
      <rect
        x="22"
        y="54"
        width="36"
        height="20"
        rx="10"
        className={on("shoulders")}
      />
      <rect
        x="50"
        y="54"
        width="40"
        height="20"
        rx="6"
        className={on("shoulders")}
      />
      <rect
        x="82"
        y="54"
        width="36"
        height="20"
        rx="10"
        className={on("shoulders")}
      />
      <rect
        x="28"
        y="76"
        width="16"
        height="46"
        rx="6"
        className={on("back")}
      />
      <rect
        x="96"
        y="76"
        width="16"
        height="46"
        rx="6"
        className={on("back")}
      />
      <rect
        x="46"
        y="76"
        width="48"
        height="32"
        rx="8"
        className={on("chest")}
      />
      <rect
        x="50"
        y="112"
        width="40"
        height="32"
        rx="8"
        className={on("abs")}
      />
      <rect
        x="40"
        y="148"
        width="60"
        height="14"
        rx="6"
        className={on("lowerBack")}
      />
      <rect x="8" y="74" width="16" height="42" rx="8" className={on("arms")} />
      <rect
        x="116"
        y="74"
        width="16"
        height="42"
        rx="8"
        className={on("arms")}
      />
      <rect
        x="6"
        y="120"
        width="14"
        height="38"
        rx="7"
        className={on("forearms")}
      />
      <rect
        x="120"
        y="120"
        width="14"
        height="38"
        rx="7"
        className={on("forearms")}
      />
      <circle cx="13" cy="166" r="6" className={QUIET} />
      <circle cx="127" cy="166" r="6" className={QUIET} />
      <rect
        x="42"
        y="166"
        width="56"
        height="26"
        rx="10"
        className={on("hips")}
      />
      <rect
        x="42"
        y="196"
        width="24"
        height="50"
        rx="10"
        className={on("thighs")}
      />
      <rect
        x="74"
        y="196"
        width="24"
        height="50"
        rx="10"
        className={on("thighs")}
      />
      <rect
        x="46"
        y="250"
        width="18"
        height="34"
        rx="8"
        className={on("calves")}
      />
      <rect
        x="76"
        y="250"
        width="18"
        height="34"
        rx="8"
        className={on("calves")}
      />
      <ellipse cx="55" cy="290" rx="12" ry="6" className={QUIET} />
      <ellipse cx="85" cy="290" rx="12" ry="6" className={QUIET} />
    </svg>
  );
}
