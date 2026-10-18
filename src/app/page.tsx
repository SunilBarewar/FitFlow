import { Navbar } from "./_components/navbar";
import { LandingPageClient } from "./_components/landing-page-client";

export default function LandingPage() {
  return (
    <div className="h-dvh overflow-y-auto overscroll-y-contain">
      <Navbar />
      <LandingPageClient />
    </div>
  );
}
