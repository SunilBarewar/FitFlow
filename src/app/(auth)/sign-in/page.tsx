"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
/* ─── Sign In Form ─── */
function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    // TODO: wire up real auth
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
  }

  return (
    <div className="flex flex-col justify-center w-full max-w-sm mx-auto py-12 px-4 sm:px-0 space-y-8">
      {/* Mobile logo */}
      <div className="lg:hidden flex items-center gap-2">
        <div className="w-7 h-7 rounded-xl bg-primary flex items-center justify-center">
          <Zap size={14} className="text-primary-foreground" />
        </div>
        <span className="text-base font-bold tracking-tight">FitFlow.</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="space-y-2"
      >
        <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="text-primary font-medium hover:underline underline-offset-4">
            Create one free
          </Link>
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08 }}
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {/* Email */}
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={cn(
              "w-full h-12 rounded-xl border bg-background px-4 text-base outline-none transition-all duration-150",
              "placeholder:text-muted-foreground/60",
              "focus:ring-2 focus:ring-ring focus:border-ring border-border"
            )}
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <Link href="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={cn(
                "w-full h-12 rounded-xl border bg-background px-4 pr-12 text-base outline-none transition-all duration-150",
                "placeholder:text-muted-foreground/60",
                "focus:ring-2 focus:ring-ring focus:border-ring border-border"
              )}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-3"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full rounded-full h-12 text-base font-semibold gap-2"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
              Signing in…
            </span>
          ) : (
            <>Sign in <ArrowRight size={16} /></>
          )}
        </Button>

        {/* Divider */}
        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground font-medium px-1">or continue with</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* OAuth */}
        <div className="grid grid-cols-2 gap-3">
          {[{ label: "Google", icon: "G" }, { label: "Apple", icon: "" }].map(({ label, icon }) => (
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

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-xs text-muted-foreground text-center"
      >
        By signing in, you agree to our{" "}
        <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">Terms</Link>
        {" "}and{" "}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy Policy</Link>.
      </motion.p>
    </div>
  );
}

export default function SignInPage() {
  return <SignInForm />;
}
