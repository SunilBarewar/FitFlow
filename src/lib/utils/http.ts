import { NextResponse } from "next/server";

export type ApiErrorBody = {
  code: string;
  message: string;
};

export function apiSuccess<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function apiError(message: string, status = 400, code = "BAD_REQUEST") {
  return NextResponse.json(
    { ok: false, error: { code, message } satisfies ApiErrorBody },
    { status },
  );
}
