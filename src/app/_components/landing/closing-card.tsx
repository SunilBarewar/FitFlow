import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import closingSky from "@/assets/closing-sky.webp";

export function ClosingCard({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <section className="px-4 pb-24 sm:px-6 sm:pb-32 lg:px-8">
      <div className="brand-reveal relative mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-line shadow-card">
        <Image
          src={closingSky}
          alt=""
          placeholder="blur"
          sizes="(min-width: 1152px) 1152px, 100vw"
          className="absolute inset-0 size-full object-cover object-bottom"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-r from-white/60 via-white/20 to-transparent"
        />

        <div className="relative max-w-xl px-7 py-16 sm:px-12 sm:py-24">
          <h2 className="text-[36px] leading-[1.05] font-medium tracking-[-0.03em] text-balance sm:text-5xl">
            Tomorrow&apos;s session is already written.
          </h2>
          <p className="max-w-md pt-4 text-[17px] leading-relaxed text-pretty text-ink-soft">
            Two minutes of setup, and you train the rest of the week with a plan
            that knows what you can do.
          </p>
          <Link
            href={isLoggedIn ? "/home" : "/sign-up"}
            className="group mt-9 inline-flex h-12 items-center gap-2 rounded-full bg-ink px-7 text-[15px] font-semibold text-white transition-colors hover:bg-ink-soft"
          >
            {isLoggedIn ? "Open FitFlow" : "Start training free"}
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
