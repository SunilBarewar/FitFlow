import { cn } from "cn";

type FitFlowLogoProps = {
  /** Icon-only or full wordmark lockup */
  variant?: "mark" | "lockup";
  /** Display height in pixels */
  size?: number;
  className?: string;
  priority?: boolean;
};

const MARK_SRC = "/brand/fitflow-mark.png";

function FitFlowMark({
  size,
  className,
  priority,
}: {
  size: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- raster brand mark from design source
    <img
      src={MARK_SRC}
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : undefined}
      aria-hidden
    />
  );
}

export function FitFlowLogo({
  variant = "lockup",
  size = 36,
  className,
  priority,
}: FitFlowLogoProps) {
  if (variant === "mark") {
    return (
      <FitFlowMark size={size} className={className} priority={priority} />
    );
  }

  const textSize = Math.max(14, Math.round(size * 0.72));

  return (
    <span
      className={cn("inline-flex items-center gap-2.5", className)}
      role="img"
      aria-label="FitFlow"
    >
      <FitFlowMark size={size} priority={priority} />
      <span
        className="font-bold tracking-tight leading-none"
        style={{ fontSize: textSize }}
        aria-hidden
      >
        <span className="text-brand-navy">Fit</span>
        <span className="text-primary">Flow</span>
        <span className="text-brand-navy">.</span>
      </span>
    </span>
  );
}
