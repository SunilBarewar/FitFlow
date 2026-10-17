import type { UserDocument } from "@/models/user";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  goal: string | null;
  createdAt: string;
};

export function serializeUser(user: UserDocument): PublicUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    goal: user.goal ?? null,
    createdAt: user.createdAt.toISOString(),
  };
}
