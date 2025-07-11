"use client";

import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ThemeProvider defaultTheme="system" storageKey="tasky-theme">
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
