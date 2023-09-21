import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "@/utils/api";
import "@/styles/globals.css";
import type { ReactElement, ReactNode } from "react";
import type { NextPage } from "next";
import { NextUIProvider } from "@nextui-org/react";
import { ThemeProvider } from "next-themes";
import { Toaster } from "react-hot-toast";

export type NextPageWithLayout<P = object, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}: {
  Component: NextPageWithLayout;
  pageProps: { session: Session | null };
}) => {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <NextUIProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        themes={["light", "dark"]}
      >
        <SessionProvider session={session}>
          {getLayout(<Component {...pageProps} />)}
          <Toaster position="bottom-right" reverseOrder={false} />
        </SessionProvider>
      </ThemeProvider>
    </NextUIProvider>
  );
};

export default api.withTRPC(MyApp);
