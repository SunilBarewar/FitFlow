import Image from "next/image";
import Link from "next/link";
import { BrandWordmark } from "@/app/_components/landing/brand-wordmark";
import { WeekRail } from "@/app/_components/landing/week-rail";
import authTrail from "@/assets/auth-trail.webp";

/* ─── The left panel ───
   A real morning, not a drawing: a footpath climbing through meadow
   grass. The promise of the product in one picture — you start on the
   path you are actually standing on. Dark text sits in the pale
   bottom-left corner, over a soft white wash. */
export function AuthPanel() {
  return (
    <div className="relative size-full overflow-hidden rounded-[28px] border border-line">
      <Image
        src={authTrail}
        alt=""
        priority
        placeholder="blur"
        sizes="(min-width: 1024px) 46vw, 100vw"
        className="absolute inset-0 size-full object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-white/65 via-white/15 to-transparent"
      />

      <div className="relative flex size-full flex-col justify-between p-10 xl:p-12">
        <Link href="/" className="w-fit" aria-label="FitFlow home">
          <BrandWordmark size={19} />
        </Link>

        <div className="max-w-sm">
          <WeekRail done={1} today={1} />
          <h2 className="pt-5 text-[40px] leading-[1.02] font-normal tracking-[-0.035em] text-balance">
            Start where you <span className="marker">actually are</span>.
          </h2>
          <p className="pt-4 text-[16px] leading-relaxed text-pretty text-ink-soft">
            Not where a twelve-week programme says you should be. One week at a
            time, built around the days you really have.
          </p>
        </div>
      </div>
    </div>
  );
}

/* The same morning, cut down to a band so phones get the feeling too. */
export function AuthPanelBanner() {
  return (
    <div className="relative h-40 overflow-hidden rounded-[24px] border border-line">
      <Image
        src={authTrail}
        alt=""
        priority
        placeholder="blur"
        sizes="100vw"
        className="absolute inset-0 size-full object-cover object-[center_38%]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-white/70 via-white/20 to-transparent"
      />

      <div className="relative flex size-full flex-col justify-between p-5">
        <Link href="/" className="w-fit" aria-label="FitFlow home">
          <BrandWordmark size={17} />
        </Link>
        <p className="text-[22px] leading-tight font-normal tracking-[-0.03em]">
          Start where you <span className="marker">actually are</span>.
        </p>
      </div>
    </div>
  );
}
