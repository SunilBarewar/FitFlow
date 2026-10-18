"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, CheckCircle2, Check } from "lucide-react";
import { FitFlowLogo } from "@/components/brand/fitflow-logo";
import { Button } from "@/components/ui/button";
import { useSignUp } from "@/features/auth/hooks/use-sign-up";
import { getErrorMessage } from "@/features/auth/lib/api-client";
import { cn } from "@/lib/utils/cn";
/* ─── Journey step data ─── */

/* ─── Sign Up Form ─── */
function SignUpForm() {
  const router = useRouter();
  const signUp = useSignUp();
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    goal: "" as string,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const goals = [
    { id: "strength", label: "Build strength" },
    { id: "fat_loss", label: "Lose weight" },
    { id: "endurance", label: "Improve endurance" },
    { id: "general", label: "Stay active" },
  ];

  function validateStep1() {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "What should we call you?";
    if (!formData.email.trim() || !formData.email.includes("@")) errs.email = "A valid email is required.";
    if (formData.password.length < 8) errs.password = "Password must be at least 8 characters.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleNext(e: React.FormEvent) {
    e.preventDefault();
    if (validateStep1()) setStep(2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.goal) {
      setErrors({ goal: "Pick a goal to get started." });
      return;
    }
    setErrors({});
    try {
      await signUp.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        goal: formData.goal,
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
    extra?: React.ReactNode
  ) => (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        {extra}
      </div>
      <div className="relative">
        <input
          id={id}
          type={id === "password" && showPassword ? "text" : type}
          autoComplete={id === "email" ? "email" : id === "password" ? "new-password" : "name"}
          value={formData[id]}
          onChange={(e) => {
            setFormData((f) => ({ ...f, [id]: e.target.value }));
            if (errors[id]) setErrors((e) => ({ ...e, [id]: "" }));
          }}
          placeholder={placeholder}
          aria-invalid={!!errors[id]}
          className={cn(
            "w-full h-12 rounded-xl border bg-background px-4 text-base outline-none transition-all duration-150",
            "placeholder:text-muted-foreground/60",
            "focus:ring-2 focus:ring-ring focus:border-ring",
            errors[id] ? "border-destructive ring-2 ring-destructive/20" : "border-border"
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
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center">
        <FitFlowLogo size={28} />
      </div>

      {/* Step indicator */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  s < step
                    ? "bg-primary text-primary-foreground"
                    : s === step
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {s < step ? <Check size={14} /> : s}
              </div>
              {s < 2 && (
                <div className={cn("w-10 h-0.5 rounded-full transition-colors duration-500", step > s ? "bg-primary" : "bg-border")} />
              )}
            </div>
          ))}
          <span className="ml-1 text-xs text-muted-foreground font-medium">
            Step {step} of 2
          </span>
        </div>

        <div className="space-y-1">
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1-heading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="text-3xl font-bold tracking-tight">Create account</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Already have an account?{" "}
                  <Link href="/sign-in" className="text-primary font-medium hover:underline underline-offset-4">
                    Sign in
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="step2-heading"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <h1 className="text-3xl font-bold tracking-tight">Your main goal?</h1>
                <p className="text-muted-foreground text-sm mt-1">
                  This shapes your first plan — you can always change it later.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Form */}
      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleNext}
            className="space-y-5"
          >
            {field("name", "Full name", "text", "Alex Johnson")}
            {field("email", "Email address", "email", "you@example.com")}
            {field("password", "Password", "password", "Min. 8 characters")}

            <Button type="submit" className="w-full rounded-full h-12 text-base font-semibold gap-2">
              Continue <ArrowRight size={16} />
            </Button>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium px-1">or sign up with</span>
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
                  className="flex items-center justify-center gap-2 h-12 rounded-xl border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <span className="text-base font-bold">{icon}</span>
                  {label}
                </button>
              ))}
            </div>
          </motion.form>
        ) : (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-3">
              {goals.map(({ id, label }) => {
                const selected = formData.goal === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setFormData((f) => ({ ...f, goal: id }));
                      if (errors.goal) setErrors((e) => ({ ...e, goal: "" }));
                    }}
                    className={cn(
                      "relative h-[72px] rounded-2xl border text-sm font-semibold text-left px-4 transition-all duration-200",
                      selected
                        ? "bg-primary text-primary-foreground border-primary ring-4 ring-primary/15"
                        : "bg-card border-border text-foreground hover:border-primary/40 hover:bg-brand-green-light/30"
                    )}
                  >
                    {selected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center"
                      >
                        <CheckCircle2 size={12} className="text-primary-foreground" />
                      </motion.div>
                    )}
                    {label}
                  </button>
                );
              })}
            </div>

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
              {errors.goal && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-xs text-destructive"
                >
                  {errors.goal}
                </motion.p>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-full h-12 text-sm border-border"
                onClick={() => setStep(1)}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-[2] rounded-full h-12 text-base font-semibold gap-2"
                disabled={signUp.isPending}
              >
                {signUp.isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                    Setting up…
                  </span>
                ) : (
                  <>
                    Start training <ArrowRight size={16} />
                  </>
                )}
              </Button>
            </div>

            {/* What happens next */}
            <div className="rounded-xl bg-muted/60 border border-border p-4 space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">What happens next</p>
              {[
                "Your coach builds a personalized plan",
                "First workout ready in under a minute",
                "No credit card required — free forever",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-primary flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-xs text-muted-foreground text-center"
      >
        By creating an account, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">Terms</Link>{" "}
        and{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy Policy</Link>.
      </motion.p>
    </div>
  );
}

export default function SignUpPage() {
  return <SignUpForm />;
}
