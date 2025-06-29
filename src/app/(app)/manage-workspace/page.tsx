import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import ManageWorkspaceClient from "./ManageWorkspaceClient";
import { notFound } from "next/navigation";

export default async function ManageWorkspacePage() {
  const session = await getServerAuthSession();
  if (!session?.user) return notFound();

  // Fetch the user from the database to get the id
  const user = await db.users.findFirst({
    where: {
      OR: [{ email: session.user.email }, { username: session.user.username }],
    },
  });
  if (!user) return notFound();

  // Fetch organizations where user is OWNER
  const ownedOrganizations = await db.organization.findMany({
    where: { ownerId: user.id },
    include: {
      members: { include: { user: true } },
      teams: {
        include: {
          members: { include: { user: true } },
        },
      },
    },
  });

  // Fetch organizations where user is a MEMBER (not owner)
  const memberOrganizations = await db.organizationMember.findMany({
    where: {
      userId: user.id,
      role: { not: "OWNER" }, // Exclude organizations where user is owner
    },
    include: {
      organization: {
        include: {
          members: { include: { user: true } },
          teams: {
            include: {
              members: { include: { user: true } },
            },
          },
        },
      },
    },
  });

  // Combine and format the organizations
  const allOrganizations = [
    ...ownedOrganizations.map((org) => ({
      ...org,
      userRole: "OWNER" as const,
    })),
    ...memberOrganizations.map((membership) => ({
      ...membership.organization,
      userRole: membership.role as "MANAGER" | "MEMBER",
    })),
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="mb-2 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-3xl font-bold text-transparent">
            Advanced Workspace Management
          </h1>
          <p className="text-muted-foreground">
            Manage your organizations, teams, and permissions in detail
          </p>
        </div>

        <ManageWorkspaceClient organizations={allOrganizations} user={user} />
      </div>
    </div>
  );
}
