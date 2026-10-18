import { Types } from "mongoose";
import { getSessionFromCookies } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { apiError } from "@/lib/utils/http";
import { ConversationModel } from "@/models/conversation";
import { MessageModel } from "@/models/message";

// ---------------------------------------------------------------------------
// PATCH /api/coach/messages
// Persists the user's selection for a block widget so it survives page refresh.
// Body: { blockId: string; selection: string[] | string }
// ---------------------------------------------------------------------------

export async function PATCH(request: Request) {
  const session = await getSessionFromCookies();
  if (!session) {
    return apiError("You're not signed in.", 401, "UNAUTHORIZED");
  }

  let body: { blockId?: unknown; selection?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return apiError("Invalid JSON body.", 400, "INVALID_JSON");
  }

  const { blockId, selection } = body;
  if (
    typeof blockId !== "string" ||
    (typeof selection !== "string" && !Array.isArray(selection))
  ) {
    return apiError(
      "Expected blockId (string) and selection (string | string[]) in body.",
      400,
      "VALIDATION_ERROR",
    );
  }

  await connectDB();

  const userId = new Types.ObjectId(session.sub);
  const conversation = await ConversationModel.findOne({ userId });
  if (!conversation) {
    return Response.json({ ok: true });
  }

  await MessageModel.updateOne(
    { conversationId: conversation._id, "block.id": blockId },
    { $set: { "block.selected": selection } },
  );

  return Response.json({ ok: true });
}
