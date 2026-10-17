import { authFetch } from "../lib/api-client";
import type { AuthResponse, PublicUser } from "../types";

export type SignInInput = {
  email: string;
  password: string;
};

export type SignUpInput = {
  name: string;
  email: string;
  password: string;
  goal: string;
};

export const authApi = {
  me: () => authFetch<{ user: PublicUser }>("/api/auth/me"),

  signIn: (input: SignInInput) =>
    authFetch<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  signUp: (input: SignUpInput) =>
    authFetch<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  signOut: () =>
    authFetch<{ signedOut: boolean }>("/api/auth/logout", {
      method: "POST",
    }),
};
