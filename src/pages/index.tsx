/* eslint-disable @typescript-eslint/no-unused-vars */
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { api } from "@/utils/api";

import { Player } from "@lottiefiles/react-lottie-player";
import Layout from "@/components/Layout";
import type { ReactElement } from "react";
import Loading from "@/components/Loading";

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
      <main className="flex h-full flex-col items-center justify-center overflow-auto bg-gradient-to-b from-base-100 to-base-300">
        <div className="flex items-center justify-center gap-4">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-4xl font-bold">Tasky</h1>
            <p className="w-1/2 text-base sm:text-xl">
              A simple task manager for your everyday tasks be they may perosnal
              or corporate.
            </p>
            {status === "authenticated" ? (
              <button className="btn rounded-full bg-base-100 px-10 py-3 font-semibold normal-case text-base-content no-underline shadow-sm transition hover:bg-base-200">
                <Link href={"/tasks"}>Get Started</Link>
              </button>
            ) : (
              <button className="btn rounded-full bg-base-100 px-10 py-3 font-semibold normal-case text-base-content no-underline shadow-sm transition hover:bg-base-200">
                <Link href={"/register"}>Get Started</Link>
              </button>
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
