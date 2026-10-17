"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth-api";
import { authQueryKeys } from "../query-keys";

export function useSignOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(authQueryKeys.session, null);
      queryClient.removeQueries({ queryKey: authQueryKeys.session });
    },
  });
}
