/* eslint-disable @typescript-eslint/no-unused-vars */
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import { api } from "@/utils/api";
import Navbar from "@/components/Navbar";

export default function Home(props) {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return (
    <>
      <Head>
        <title>Tasky</title>
      </Head>
      {/* <Navbar /> */}
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-base-100 to-base-300">
        <AuthShowcase />
        <div className="flex flex-col items-center justify-center gap-4">
          <Link href="/tasks">
            <p className="rounded-full bg-base-100 px-10 py-3 font-semibold text-base-content no-underline transition hover:bg-base-200">
              Tasks
            </p>
          </Link>
          <Link href="/about"></Link>
        </div>
      </main>
    </>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();

  console.log(sessionData);

  const { data: secretMessage } = api.example.getSecretMessage.useQuery(
    undefined, // no input
    { enabled: sessionData?.user !== undefined }
  );

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <p className="text-center text-2xl text-base-content">
        {sessionData && <span>Logged in as {sessionData.user?.username}</span>}
        {secretMessage && <span> - {secretMessage}</span>}
      </p>
      <button
        className="rounded-full bg-base-100 px-10 py-3 font-semibold text-base-content no-underline transition hover:bg-base-200"
        onClick={sessionData ? () => void signOut() : () => void signIn()}
      >
        {sessionData ? "Sign out" : "Sign in"}
      </button>
    </div>
  );
}
