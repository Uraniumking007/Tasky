import { Suspense } from "react";
import { SettingsClient } from "./client";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      <Suspense fallback={<div>Loading settings...</div>}>
        <SettingsClient user={session.user} />
      </Suspense>
    </div>
  );
}
