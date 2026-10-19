"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { toast } from "@/components/ui/fit-toaster";

/* The pieces sign-in and sign-up share below their fields. */

export function AuthSubmit({
  label,
  pendingLabel,
  pending,
}: {
  label: string;
  pendingLabel: string;
  pending: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink text-[15px] font-semibold text-white transition-colors hover:bg-ink-soft disabled:opacity-60"
    >
      {pending ? (
        <>
          <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          {pendingLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-0.5"
          />
        </>
      )}
    </button>
  );
}

export function AuthFormError({ message }: { message: string }) {
  return (
    <p
      role="alert"
      className="rounded-2xl border border-danger/25 bg-danger/5 px-4 py-3 text-[14px] text-danger"
    >
      {message}
    </p>
  );
}

export function OAuthRow({ verb }: { verb: "sign-in" | "sign-up" }) {
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[12px] font-medium text-ink-subtle">
          or continue with
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {["Google", "Apple"].map((provider) => (
          <button
            key={provider}
            type="button"
            onClick={() =>
              toast.info(`${provider} ${verb} isn't available yet`, {
                description:
                  "Use email and password for now — we're working on it.",
              })
            }
            className="flex h-11 items-center justify-center rounded-full border border-line bg-surface text-[14px] font-semibold text-ink-soft shadow-card transition-colors hover:bg-sunken"
          >
            {provider}
          </button>
        ))}
      </div>
    </>
  );
}

export function AuthLegal({ action }: { action: string }) {
  return (
    <p className="text-center text-[12px] leading-relaxed text-ink-subtle">
      By {action} you agree to our{" "}
      <Link href="#" className="underline underline-offset-4 hover:text-ink">
        Terms
      </Link>{" "}
      and{" "}
      <Link href="#" className="underline underline-offset-4 hover:text-ink">
        Privacy Policy
      </Link>
      .
    </p>
  );
}
