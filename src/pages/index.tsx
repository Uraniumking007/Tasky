/* eslint-disable @typescript-eslint/no-unused-vars */
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { api } from "@/utils/api";

import { Player } from "@lottiefiles/react-lottie-player";
import Layout from "@/components/Layout";
import type { ReactElement } from "react";
import Loading from "@/components/Loading";
import { Button } from "@nextui-org/react";

export default function Home(props) {
  const { data: sessionData, status } = useSession();

  console.log(sessionData);

  if (status === "loading") {
    return <Loading />;
  }

  return (
    <>
      <Head>
        <title>Tasky</title>
      </Head>
      <main className="flex h-full flex-col items-center justify-center overflow-auto bg-background">
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-4xl font-bold text-black dark:text-white">
              Tasky
            </h1>
            <p className="w-1/2 text-black dark:text-white sm:text-xl">
              A simple task manager for your everyday tasks be they may perosnal
              or corporate.
            </p>
            {status === "authenticated" ? (
              <Button radius="full">
                <Link href={"/tasks"}>Get Started</Link>
              </Button>
            ) : (
              <Button radius="full">
                <Link href={"/login"}>Get Started</Link>
              </Button>
            )}
          </div>
          <Player
            autoplay
            loop={true}
            direction={1}
            controls={false}
            speed={1}
            keepLastFrame
            src="/animations/tasks.json"
            className="hidden md:block"
          />
        </div>
      </main>
    </>
  );
}

Home.getLayout = function getLayout(page: ReactElement) {
  return <Layout>{page}</Layout>;
};
