import { apiError, apiSuccess } from "@/lib/utils/http";
import { serializeUser } from "@/lib/auth/serialize-user";
import { getSessionFromCookies } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/user";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return apiError("You're not signed in.", 401, "UNAUTHORIZED");
  }

  try {
    await connectDB();
    const user = await UserModel.findById(session.sub);
    if (!user) {
      return apiError(
        "Your session is no longer valid. Please sign in again.",
        401,
        "UNAUTHORIZED",
      );
    }

    return apiSuccess({ user: serializeUser(user) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load your profile.";
    return apiError(message, 500, "SESSION_FAILED");
  }
}
