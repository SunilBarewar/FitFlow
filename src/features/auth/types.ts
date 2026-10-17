export type PublicUser = {
  id: string;
  name: string;
  email: string;
  goal: string | null;
  createdAt: string;
};

export type AuthResponse = {
  user: PublicUser;
};

export type ApiErrorPayload = {
  code: string;
  message: string;
};

export type ApiEnvelope<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiErrorPayload };
