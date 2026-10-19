"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { AuthField } from "@/components/auth/auth-field";
import {
  AuthFormError,
  AuthLegal,
  AuthSubmit,
  OAuthRow,
} from "@/components/auth/auth-form-parts";
import { useSignIn } from "@/features/auth/hooks/use-sign-in";
import { getErrorMessage } from "@/features/auth/lib/api-client";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signIn = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const callbackUrl = searchParams.get("callbackUrl") ?? "/chat";

  async function handleSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    try {
      await signIn.mutateAsync({ email, password });
      router.push(callbackUrl.startsWith("/") ? callbackUrl : "/chat");
    } catch (err) {
      setError(
        getErrorMessage(err, "We couldn't sign you in. Please try again."),
      );
    }
  }

  return (
    <div className="brand-rise w-full max-w-sm">
      <h1 className="text-[34px] leading-[1.05] font-medium tracking-[-0.03em]">
        Welcome back
      </h1>
      <p className="pt-2 text-[15px] text-ink-muted">
        New here?{" "}
        <Link
          href="/sign-up"
          className="font-semibold text-ink underline decoration-accent-edge/60 decoration-2 underline-offset-4 hover:decoration-accent-edge"
        >
          Create an account
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-9">
        <AuthField
          label="Email address"
          type="email"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
        />

        <AuthField
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          placeholder="Your password"
        />

        {error ? <AuthFormError message={error} /> : null}

        <AuthSubmit
          label="Sign in"
          pendingLabel="Signing in…"
          pending={signIn.isPending}
        />

        <OAuthRow verb="sign-in" />
      </form>

      <div className="pt-8">
        <AuthLegal action="signing in," />
      </div>
    </div>
  );
}

function SignInFallback() {
  return (
    <div className="w-full max-w-sm">
      <div className="h-9 w-48 animate-pulse rounded-xl bg-sunken" />
      <div className="mt-3 h-4 w-56 animate-pulse rounded-lg bg-sunken" />
      <div className="mt-9 flex flex-col gap-5">
        <div className="h-12 animate-pulse rounded-2xl bg-sunken" />
        <div className="h-12 animate-pulse rounded-2xl bg-sunken" />
        <div className="h-12 animate-pulse rounded-full bg-sunken" />
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm />
    </Suspense>
  );
}
