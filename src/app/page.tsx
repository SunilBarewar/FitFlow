import { getSessionFromCookies } from "@/lib/auth/session";
import { ClosingCard } from "./_components/landing/closing-card";
import { Faq } from "./_components/landing/faq";
import { FeaturesBento } from "./_components/landing/features-bento";
import { Hero } from "./_components/landing/hero";
import { HowItWorks } from "./_components/landing/how-it-works";
import { LandingNavClient } from "./_components/landing/landing-nav-client";
import { ProductStage } from "./_components/landing/product-stage";
import { SiteFooter } from "./_components/landing/site-footer";

export default async function LandingPage() {
  const session = await getSessionFromCookies();
  const isLoggedIn = !!session;

  return (
    <div
      id="landing-scroll"
      className="brand-surface h-dvh overflow-x-clip overflow-y-auto overscroll-y-contain"
    >
      <LandingNavClient isLoggedIn={isLoggedIn} />
      <main>
        <Hero isLoggedIn={isLoggedIn} />
        <ProductStage />
        <FeaturesBento />
        <HowItWorks />
        <Faq />
        <ClosingCard isLoggedIn={isLoggedIn} />
      </main>
      <SiteFooter />
    </div>
  );
}
