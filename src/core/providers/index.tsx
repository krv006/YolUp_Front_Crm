import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { ReactNode } from "react";

import { useThemeStore } from "@/shared/model";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export function AppProvider({ children }: { children: ReactNode }) {
  const theme = useThemeStore((state) => state.theme);

  return (
    <QueryClientProvider client={queryClient}>
      {import.meta.env.VITE_ENABLE_QUERY_DEVTOOLS !== "false" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
      {children}
      <Toaster
        position="bottom-center"
        theme={theme}
        toastOptions={{
          classNames: {
            toast:
              "!rounded-full !border-0 !bg-brand-900 !px-5 !py-3 !text-sm !font-semibold !text-white !shadow-md",
            description: "!text-ink-on-dark-2",
            success: "!text-white",
            error: "!text-white",
          },
        }}
      />
    </QueryClientProvider>
  );
}
