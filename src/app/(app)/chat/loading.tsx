import { Loader2 } from "lucide-react";

export default function ChatLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div
        className="flex flex-col items-center gap-3"
        role="status"
        aria-live="polite"
      >
        <Loader2 size={28} className="animate-spin text-primary" aria-hidden />
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Loading...</p>
          <p className="text-sm text-muted-foreground">Please wait...</p>
        </div>
      </div>
    </div>
  );
}
