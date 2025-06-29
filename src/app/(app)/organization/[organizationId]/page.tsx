import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { OrganizationPageClient } from "./page-client";

interface OrganizationPageProps {
  params: {
    organizationId: string;
  };
}

export default async function OrganizationPage({
  params,
}: OrganizationPageProps) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  return <OrganizationPageClient organizationId={params.organizationId} />;
}
