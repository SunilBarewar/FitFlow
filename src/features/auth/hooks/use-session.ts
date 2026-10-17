"use client";

import { useQuery } from "@tanstack/react-query";
import { authApi } from "../api/auth-api";
import { AuthApiError } from "../lib/api-client";
import { authQueryKeys } from "../query-keys";

export function useSession() {
  return useQuery({
    queryKey: authQueryKeys.session,
    queryFn: async () => {
      try {
        const { user } = await authApi.me();
        return user;
      } catch (error) {
        if (error instanceof AuthApiError && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
    retry: (failureCount, error) => {
      if (error instanceof AuthApiError && error.status === 401) {
        return false;
      }
      return failureCount < 1;
    },
    staleTime: 60_000,
  });
}
