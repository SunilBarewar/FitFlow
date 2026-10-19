"use client";

import { Eye, EyeOff } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "@/lib/utils/cn";

/* One labelled input, with the password eye and the inline error
   message folded in. Shared by sign-in and sign-up so the two forms
   stay identical in everything but their fields. */
export function AuthField({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
  action,
}: {
  label: string;
  type: "text" | "email" | "password";
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  /** Rendered opposite the label, e.g. a "Forgot password?" link. */
  action?: React.ReactNode;
}) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-soft">
          {label}
        </label>
        {action}
      </div>

      <div className="relative">
        <input
          id={id}
          type={isPassword && revealed ? "text" : type}
          autoComplete={autoComplete}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(
            "h-12 w-full rounded-2xl border bg-surface px-4 text-[15px] text-ink outline-none transition-colors",
            "placeholder:text-ink-subtle",
            "focus:border-accent-edge focus:ring-2 focus:ring-accent-edge/35",
            isPassword && "pr-12",
            error ? "border-danger" : "border-line",
          )}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setRevealed((shown) => !shown)}
            className="absolute top-1/2 right-2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-subtle transition-colors hover:bg-sunken hover:text-ink-soft"
            aria-label={revealed ? "Hide password" : "Show password"}
          >
            {revealed ? <EyeOff size={17} /> : <Eye size={17} />}
          </button>
        ) : null}
      </div>

      {error ? (
        <p id={`${id}-error`} className="text-[13px] text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
