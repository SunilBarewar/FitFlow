import { NextResponse } from "next/server";
import { apiError } from "@/lib/utils/http";
import { serializeUser } from "@/lib/auth/serialize-user";
import { setSessionCookie } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/user";

const GOALS = ["strength", "fat_loss", "endurance", "general"] as const;
type FitnessGoal = (typeof GOALS)[number];
const GOAL_SET = new Set<string>(GOALS);

type RegisterBody = {
  name?: string;
  email?: string;
  password?: string;
  goal?: string;
};

export async function POST(request: Request) {
  let body: RegisterBody;
  try {
    body = (await request.json()) as RegisterBody;
  } catch {
    return apiError("Invalid JSON body.", 400, "INVALID_JSON");
  }

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const goalInput = body.goal?.trim() ?? "general";

  if (!name) {
    return apiError("What should we call you?", 400, "VALIDATION_ERROR");
  }
  if (!email || !email.includes("@")) {
    return apiError("A valid email is required.", 400, "VALIDATION_ERROR");
  }
  if (password.length < 8) {
    return apiError(
      "Password must be at least 8 characters.",
      400,
      "VALIDATION_ERROR",
    );
  }
  if (!GOAL_SET.has(goalInput)) {
    return apiError("Pick a valid fitness goal.", 400, "VALIDATION_ERROR");
  }
  const goal = goalInput as FitnessGoal;

  try {
    await connectDB();

    const existing = await UserModel.findOne({ email }).select("_id");
    if (existing) {
      return apiError(
        "An account with this email already exists. Try signing in.",
        409,
        "EMAIL_IN_USE",
      );
    }

    const user = await UserModel.create({
      name,
      email,
      password,
      goal,
    });

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
      error instanceof Error ? error.message : "Could not create account.";
    return apiError(message, 500, "REGISTER_FAILED");
  }
}
