import { AuthPanel, AuthPanelBanner } from "@/components/auth/auth-panel";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="brand-surface flex h-dvh overflow-hidden">
      {/* The picture half — desktop only; phones get the banner instead. */}
      <div className="hidden shrink-0 p-3 lg:block lg:w-[46%] xl:w-[44%]">
        <AuthPanel />
      </div>

      <div className="flex-1 overflow-y-auto overscroll-y-contain">
        <div className="flex min-h-full flex-col">
          <div className="p-3 lg:hidden">
            <AuthPanelBanner />
          </div>

          <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
