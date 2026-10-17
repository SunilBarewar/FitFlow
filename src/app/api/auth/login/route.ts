import { NextResponse } from "next/server";
import { apiError } from "@/lib/utils/http";
import { serializeUser } from "@/lib/auth/serialize-user";
import { setSessionCookie } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { UserModel, verifyUserPassword } from "@/models/user";

type LoginBody = {
  email?: string;
  password?: string;
};

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = (await request.json()) as LoginBody;
  } catch {
    return apiError("Invalid JSON body.", 400, "INVALID_JSON");
  }

  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";

  if (!email || !password) {
    return apiError("Please fill in all fields.", 400, "VALIDATION_ERROR");
  }

  try {
    await connectDB();

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
      return apiError(
        "We couldn't find an account with that email.",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    const valid = await verifyUserPassword(user, password);
    if (!valid) {
      return apiError(
        "That password doesn't match. Try again.",
        401,
        "INVALID_CREDENTIALS",
      );
    }

    const response = NextResponse.json({
      ok: true,
      data: { user: serializeUser(user) },
    });

    await setSessionCookie(response, {
      sub: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    return response;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not sign you in.";
    return apiError(message, 500, "LOGIN_FAILED");
  }
}
