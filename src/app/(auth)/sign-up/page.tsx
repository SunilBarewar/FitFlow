"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthField } from "@/components/auth/auth-field";
import {
  AuthFormError,
  AuthLegal,
  AuthSubmit,
  OAuthRow,
} from "@/components/auth/auth-form-parts";
import { useSignUp } from "@/features/auth/hooks/use-sign-up";
import { getErrorMessage } from "@/features/auth/lib/api-client";

type Fields = { name: string; email: string; password: string };

export default function SignUpPage() {
  const router = useRouter();
  const signUp = useSignUp();
  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof Fields | "form", string>>
  >({});

  function set(field: keyof Fields) {
    return (value: string) => {
      setFields((current) => ({ ...current, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };
  }

  function validate() {
    const found: Partial<Record<keyof Fields, string>> = {};
    if (!fields.name.trim()) found.name = "What should we call you?";
    if (!fields.email.trim() || !fields.email.includes("@"))
      found.email = "A valid email is required.";
    if (fields.password.length < 8)
      found.password = "Password must be at least 8 characters.";
    setErrors(found);
    return Object.keys(found).length === 0;
  }

  async function handleSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    if (!validate()) return;
    setErrors({});
    try {
      await signUp.mutateAsync({
        name: fields.name.trim(),
        email: fields.email.trim(),
        password: fields.password,
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

  return (
    <div className="brand-rise w-full max-w-sm">
      <h1 className="text-[34px] leading-[1.05] font-medium tracking-[-0.03em]">
        Your first week
      </h1>
      <p className="pt-2 text-[15px] text-ink-muted">
        Already training with us?{" "}
        <Link
          href="/sign-in"
          className="font-semibold text-ink underline decoration-accent-edge/60 decoration-2 underline-offset-4 hover:decoration-accent-edge"
        >
          Sign in
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-9">
        <AuthField
          label="Your name"
          type="text"
          autoComplete="name"
          value={fields.name}
          onChange={set("name")}
          placeholder="Alex Johnson"
          error={errors.name}
        />

        <AuthField
          label="Email address"
          type="email"
          autoComplete="email"
          value={fields.email}
          onChange={set("email")}
          placeholder="you@example.com"
          error={errors.email}
        />

        <AuthField
          label="Password"
          type="password"
          autoComplete="new-password"
          value={fields.password}
          onChange={set("password")}
          placeholder="At least 8 characters"
          error={errors.password}
        />

        {errors.form ? <AuthFormError message={errors.form} /> : null}

        <AuthSubmit
          label="Create account"
          pendingLabel="Creating account…"
          pending={signUp.isPending}
        />

        <OAuthRow verb="sign-up" />
      </form>

      <div className="pt-8">
        <AuthLegal action="creating an account," />
      </div>
    </div>
  );
}
