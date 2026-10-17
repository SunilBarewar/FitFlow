import { AuthPanel } from "@/components/auth/auth-panel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <div className="lg:w-[55%] xl:w-[52%] flex-shrink-0">
        <AuthPanel />
      </div>
      <div className="flex-1 flex items-center justify-center bg-background overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
