import { type NextRequest, NextResponse } from "next/server";
import {
  AUTH_ROUTES,
  PROTECTED_ROUTE_PREFIXES,
  SESSION_COOKIE_NAME,
} from "@/lib/auth/constants";
import { verifySessionToken } from "@/lib/auth/jwt";

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isAuthPath(pathname: string): boolean {
  return AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (isProtectedPath(pathname) && !session) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  // /home is the signed-in landing; it redirects on to /chat when the user
  // has no active plan (the proxy can't read the database to know that).
  if (isAuthPath(pathname) && session) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/home/:path*", "/sign-in", "/sign-up"],
};
