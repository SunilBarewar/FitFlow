import type { ApiEnvelope, ApiErrorPayload } from "../types";

export class AuthApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.name = "AuthApiError";
    this.code = code;
    this.status = status;
  }
}

export async function authFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  let body: ApiEnvelope<T>;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    throw new AuthApiError(
      "We couldn't reach the server. Check your connection and try again.",
      "NETWORK_ERROR",
      res.status || 0,
    );
  }

  if (!res.ok || !body.ok) {
    const err = !body.ok ? body.error : undefined;
    throw new AuthApiError(
      err?.message ?? "Something went wrong. Please try again.",
      err?.code ?? "REQUEST_FAILED",
      res.status,
    );
  }

  return body.data;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof AuthApiError) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}
