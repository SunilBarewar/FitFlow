import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import heroDunes from "@/assets/hero-dunes.webp";

/* The landscape fills the hero and only its bottom quarter fades into
   the canvas. The section's min-height grows with the viewport so the
   top of the grass stays level with the button at every width: the
   land occupies the bottom ~22% of the frame, so the fit is
   min-h = buttonBottom + 30 + 0.147 x width. Measured at 390 / 768 /
   1024 / 1512 / 1920 — re-fit it if the hero copy changes height. */
export function Hero({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="relative -mt-[68px] min-h-[480px] pt-[68px] sm:-mt-[72px] sm:pt-[72px] md:min-h-[calc(503px_+_14.7vw)]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <Image
          src={heroDunes}
          alt=""
          priority
          placeholder="blur"
          sizes="100vw"
          className="size-full object-cover object-bottom"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/4 bg-linear-to-b from-transparent to-canvas" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 pt-20 pb-16 sm:px-6 sm:pt-24 sm:pb-20 lg:px-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h1 className="brand-rise text-[44px] leading-[0.98] font-normal tracking-[-0.035em] text-balance sm:text-6xl lg:text-[76px]">
            A coach who plans around <span className="marker">your week</span>.
          </h1>

          <p
            className="brand-rise max-w-2xl pt-6 text-[18px] leading-relaxed text-pretty text-ink-muted sm:text-xl"
            style={{ animationDelay: "90ms" }}
          >
            Tell FitFlow how your week looks. The plan adapts as life does.
          </p>

          <div className="brand-rise pt-9" style={{ animationDelay: "180ms" }}>
            <Link
              href={isLoggedIn ? "/home" : "/sign-up"}
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-[15px] font-semibold text-white transition-colors hover:bg-ink-soft"
            >
              {isLoggedIn ? "Open FitFlow" : "Start training free"}
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
