import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "./constants";
import { createSessionToken, type SessionPayload, verifySessionToken } from "./jwt";

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};

export async function setSessionCookie(
  response: NextResponse,
  payload: SessionPayload,
): Promise<void> {
  const token = await createSessionToken(payload);
  response.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions);
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    ...sessionCookieOptions,
    maxAge: 0,
  });
}

export async function getSessionFromRequestCookie(
  cookieValue: string | undefined,
): Promise<SessionPayload | null> {
  if (!cookieValue) {
    return null;
  }
  return verifySessionToken(cookieValue);
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return getSessionFromRequestCookie(token);
}
