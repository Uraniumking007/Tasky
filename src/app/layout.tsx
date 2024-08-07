import "@/styles/globals.css";
import { Nunito } from "next/font/google";

import { TRPCReactProvider } from "@/trpc/react";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Tasky",
  description:
    "Tasky is a simple and powerful task management app that helps you stay organized and on track.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const nunito = Nunito({
  subsets: ["latin"],
  display: "swap",
  style: ["italic", "normal"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${nunito.className}`}>
      <body className="dark flex h-screen w-screen justify-center">
        <TRPCReactProvider>{children}</TRPCReactProvider>
        <Toaster />
      </body>
    </html>
  );
}
