"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // Create a QueryClient instance per request/session lifecycle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes cache
            gcTime: 1000 * 60 * 10, // 10 minutes garbage collection
            refetchOnWindowFocus: false, // 창 포커스 시 자동 재요청 비활성화 (실시간 폴링 방지)
            refetchOnReconnect: false, // 네트워크 재연결 시 자동 재요청 비활성화
            refetchInterval: false, // 주기적 자동 폴링 비활성화 (실시간 기능 없음)
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
