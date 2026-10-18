import { type HydratedDocument, type InferSchemaType, Schema, Types } from "mongoose";
import { registerModel } from "@/lib/db";

// ---------------------------------------------------------------------------
// Sub-schemas (mirror types.ts — _id disabled to keep docs lean)
// ---------------------------------------------------------------------------

const exerciseSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    sets: { type: Number, required: true },
    reps: { type: String, required: true },
    equipment: { type: String, required: true },
  },
  { _id: false },
);

const planDaySchema = new Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    focus: { type: String, required: true },
    exercises: { type: [exerciseSchema], default: [] },
  },
  { _id: false },
);

const planSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    version: { type: Number, default: 1 },
    status: { type: String, enum: ["draft", "active"], default: "active" },
    daysPerWeek: { type: Number, required: true },
    minutesPerSession: { type: Number, required: true },
    days: { type: [planDaySchema], default: [] },
  },
  { _id: false },
);

// ---------------------------------------------------------------------------
// Conversation schema — exactly one document per user
// ---------------------------------------------------------------------------

const conversationSchema = new Schema(
  {
    userId: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    /**
     * True once the user has accepted a weekly training plan.
     * Drives the right-panel visibility in the chat UI.
     */
    hasPlan: {
      type: Boolean,
      default: false,
    },
    /**
     * The currently active weekly plan (overwritten when the user adopts a
     * new plan — we only ever store the latest one).
     */
    activePlan: {
      type: planSchema,
      default: null,
    },
  },
  { timestamps: true },
);

export type Conversation = InferSchemaType<typeof conversationSchema>;
export type ConversationDocument = HydratedDocument<Conversation>;

export const ConversationModel = registerModel<Conversation>(
  "Conversation",
  conversationSchema,
);
