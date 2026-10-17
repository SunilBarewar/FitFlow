"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type SignInInput } from "../api/auth-api";
import { authQueryKeys } from "../query-keys";

export function useSignIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignInInput) => authApi.signIn(input),
    onSuccess: (data) => {
      queryClient.setQueryData(authQueryKeys.session, data.user);
    },
  });
}
