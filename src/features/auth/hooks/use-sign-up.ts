"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, type SignUpInput } from "../api/auth-api";
import { authQueryKeys } from "../query-keys";

export function useSignUp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: SignUpInput) => authApi.signUp(input),
    onSuccess: (data) => {
      queryClient.setQueryData(authQueryKeys.session, data.user);
    },
  });
}
