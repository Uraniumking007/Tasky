import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { TeamPageClient } from "./page-client";

interface TeamPageProps {
  params: {
    teamId: string;
  };
}

export default async function TeamPage({ params }: TeamPageProps) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return <TeamPageClient teamId={params.teamId} />;
}
