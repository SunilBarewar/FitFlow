import {
  type HydratedDocument,
  type InferSchemaType,
  Schema,
  Types,
} from "mongoose";
import { registerModel } from "@/lib/db";

// ---------------------------------------------------------------------------
// Message schema — stored in a separate collection so conversations can grow
// to hundreds of messages without hitting the 16 MB document size limit.
// ---------------------------------------------------------------------------

const messageSchema = new Schema(
  {
    conversationId: {
      type: Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    /** Plain-text content of the message (may be absent for widget-only turns). */
    text: {
      type: String,
      default: null,
    },
    /**
     * Optional chat widget / block attached to an assistant message
     * (choice_chips, plan_preview, safety_notice, etc.).
     * Stored as a free-form JSON blob so we don't need to version the schema
     * every time a new block type is added.
     */
    block: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

// Compound index for efficient last-N message queries per conversation
messageSchema.index({ conversationId: 1, createdAt: 1 });

export type Message = InferSchemaType<typeof messageSchema>;
export type MessageDocument = HydratedDocument<Message>;

export const MessageModel = registerModel<Message>("Message", messageSchema);
