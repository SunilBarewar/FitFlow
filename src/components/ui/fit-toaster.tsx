"use client";

import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";
import { FitFlowLogo } from "@/components/brand/fitflow-logo";
import { Toaster as SonnerToaster, toast as sonnerToast } from "sonner";

function ToastIcon({
  variant,
}: {
  variant: "success" | "error" | "info" | "loading";
}) {
  const base =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl";

  if (variant === "success") {
    return (
      <span className={`${base} bg-brand-green-light text-primary`}>
        <CheckCircle2 size={18} aria-hidden />
      </span>
    );
  }
  if (variant === "error") {
    return (
      <span className={`${base} bg-destructive/10 text-destructive`}>
        <AlertCircle size={18} aria-hidden />
      </span>
    );
  }
  if (variant === "loading") {
    return (
      <span className={`${base} bg-muted text-muted-foreground`}>
        <Loader2 size={18} className="animate-spin" aria-hidden />
      </span>
    );
  }
  return (
    <span className={`${base} bg-brand-sky-light text-info`}>
      <Info size={18} aria-hidden />
    </span>
  );
}

export function FitToaster() {
  return (
    <SonnerToaster
      position="top-center"
      closeButton
      expand
      visibleToasts={4}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full max-w-[calc(100vw-2rem)] sm:max-w-md items-start gap-3 rounded-xl border border-border bg-card p-4 text-foreground",
          title: "text-sm font-semibold leading-snug",
          description: "text-sm text-muted-foreground leading-relaxed mt-0.5",
          closeButton:
            "absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
          actionButton:
            "rounded-pill h-9 px-4 text-sm font-semibold bg-primary text-primary-foreground",
          cancelButton:
            "rounded-pill h-9 px-4 text-sm font-medium border border-border bg-background",
        },
      }}
      icons={{
        success: <ToastIcon variant="success" />,
        error: <ToastIcon variant="error" />,
        info: <ToastIcon variant="info" />,
        loading: <ToastIcon variant="loading" />,
      }}
    />
  );
}

type ToastOptions = {
  description?: string;
};

export const toast = {
  success(title: string, options?: ToastOptions) {
    sonnerToast.success(title, options);
  },
  error(title: string, options?: ToastOptions) {
    sonnerToast.error(title, options);
  },
  info(title: string, options?: ToastOptions) {
    sonnerToast.info(title, options);
  },
  loading(title: string, options?: ToastOptions) {
    sonnerToast.loading(title, options);
  },
  welcome(name: string) {
    sonnerToast.custom(() => (
      <div
        className="flex w-full max-w-md items-start gap-3 rounded-xl border border-border bg-card p-4"
        role="status"
      >
        <FitFlowLogo variant="mark" size={36} className="shrink-0" />
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="text-sm font-semibold leading-snug">
            Welcome back, {name.split(" ")[0]}!
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-0.5">
            Your coach is ready when you are.
          </p>
        </div>
      </div>
    ));
  },
};
