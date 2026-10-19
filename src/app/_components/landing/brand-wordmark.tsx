import { cn } from "@/lib/utils/cn";

/* The marketing lockup. The app's green tile mark is deliberately not
   used here: on a calm, near-white page it is the loudest thing on
   screen. Typography plus one honey dot carries the brand instead.
   Swap this component out to go back to <FitFlowLogo />. */
export function BrandWordmark({
  className,
  size = 17,
}: {
  className?: string;
  /** Font size in pixels. */
  size?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center leading-none font-semibold tracking-[-0.03em] text-ink",
        className,
      )}
      style={{ fontSize: size }}
      role="img"
      aria-label="FitFlow"
    >
      <span aria-hidden>FitFlow</span>
      <span
        aria-hidden
        className="ml-[3px] rounded-full bg-accent-edge"
        style={{ width: size * 0.19, height: size * 0.19 }}
      />
    </span>
  );
}
