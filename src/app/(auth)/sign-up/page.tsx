"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { FitFlowLogo } from "@/components/brand/fitflow-logo";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/fit-toaster";
import { useSignUp } from "@/features/auth/hooks/use-sign-up";
import { getErrorMessage } from "@/features/auth/lib/api-client";
import { cn } from "@/lib/utils/cn";

function showOAuthComingSoon(provider: string) {
  toast.info(`${provider} sign-up isn't available yet`, {
    description: "Use email and password for now — we're working on it.",
  });
}

function SignUpForm() {
  const router = useRouter();
  const signUp = useSignUp();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "What should we call you?";
    if (!formData.email.trim() || !formData.email.includes("@"))
      errs.email = "A valid email is required.";
    if (formData.password.length < 8)
      errs.password = "Password must be at least 8 characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setErrors({});
    try {
      await signUp.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        goal: "general",
      });
      router.push("/chat");
    } catch (err) {
      setErrors({
        form: getErrorMessage(
          err,
          "We couldn't create your account. Please try again.",
        ),
      });
    }
  }

  const field = (
    id: keyof typeof formData,
    label: string,
    type: string,
    placeholder: string,
  ) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={id === "password" && showPassword ? "text" : type}
          autoComplete={
            id === "email"
              ? "email"
              : id === "password"
                ? "new-password"
                : "name"
          }
          value={formData[id]}
          onChange={(e) => {
            setFormData((f) => ({ ...f, [id]: e.target.value }));
            if (errors[id]) setErrors((prev) => ({ ...prev, [id]: "" }));
          }}
          placeholder={placeholder}
          aria-invalid={!!errors[id]}
          className={cn(
            "w-full h-12 rounded-xl border bg-background px-4 text-base outline-none transition-all duration-150",
            "placeholder:text-muted-foreground/60",
            "focus:ring-2 focus:ring-ring focus:border-ring",
            errors[id]
              ? "border-destructive ring-2 ring-destructive/20"
              : "border-border",
          )}
        />
        {id === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      <AnimatePresence>
        {errors[id] && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-destructive"
          >
            {errors[id]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex flex-col justify-center w-full max-w-sm mx-auto py-12 px-4 sm:px-0 space-y-8">
      <div className="lg:hidden flex items-center">
        <FitFlowLogo size={28} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Already have an account?{" "}
          <Link
            href="/sign-in"
            className="text-primary font-medium hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {field("name", "Full name", "text", "Alex Johnson")}
        {field("email", "Email address", "email", "you@example.com")}
        {field("password", "Password", "password", "Min. 8 characters")}

        <AnimatePresence>
          {errors.form && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3"
            >
              {errors.form}
            </motion.p>
          )}
        </AnimatePresence>

        <Button
          type="submit"
          className="w-full rounded-full h-12 text-base font-semibold gap-2"
          disabled={signUp.isPending}
        >
          {signUp.isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Creating account…
            </span>
          ) : (
            <>
              Create account <ArrowRight size={16} />
            </>
          )}
        </Button>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium px-1">
            or sign up with
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Google", icon: "G" },
            { label: "Apple", icon: "" },
          ].map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => showOAuthComingSoon(label)}
              className="flex items-center justify-center gap-2 h-12 rounded-xl border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              <span className="text-base font-bold">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-muted-foreground text-center"
      >
        By creating an account, you agree to our{" "}
        <Link
          href="/terms"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Terms
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Privacy Policy
        </Link>
        .
      </motion.p>
    </div>
  );
}

export default function SignUpPage() {
  return <SignUpForm />;
}
