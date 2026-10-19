"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { useState } from "react";
import { FitToaster } from "@/components/ui/fit-toaster";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* Honour the OS "reduce motion" setting everywhere at once. */}
      <MotionConfig reducedMotion="user">
        {children}
        <FitToaster />
      </MotionConfig>
    </QueryClientProvider>
  );
}
