import bcrypt from "bcryptjs";
import { type HydratedDocument, type InferSchemaType, Schema } from "mongoose";
import { registerModel } from "@/lib/db";

const SALT_ROUNDS = 12;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
    },
    goal: {
      type: String,
      enum: ["strength", "fat_loss", "endurance", "general"],
      default: "general",
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, SALT_ROUNDS);
});

export type User = InferSchemaType<typeof userSchema>;
export type UserDocument = HydratedDocument<User>;

export async function verifyUserPassword(
  user: Pick<UserDocument, "password">,
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, user.password);
}

export const UserModel = registerModel<User>("User", userSchema);
