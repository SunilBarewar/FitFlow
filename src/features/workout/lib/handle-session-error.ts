import { SessionImmutableError } from "./guards";
import { apiError } from "@/lib/utils/http";

export function sessionStoreApiError(error: unknown) {
  if (error instanceof SessionImmutableError) {
    return apiError(error.message, 409, "SESSION_IMMUTABLE");
  }
  throw error;
}
