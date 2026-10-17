import { NextResponse } from "next/server";
import { apiSuccess } from "@/lib/utils/http";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  const response = apiSuccess({ signedOut: true });
  clearSessionCookie(response);
  return response;
}
