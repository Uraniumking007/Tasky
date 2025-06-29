import { TaskCreationModal } from "@/components/modals/create-task-modal";
import WorkspaceLayout from "@/components/workspace-layout";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import type { User } from "next-auth";
import { type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { getUserPermissions } from "@/lib/permissions";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  const user = session?.user as User; // Cast the user object to the User type

  // Get user from database
  const dbUser = await db.users.findFirst({
    where: {
      OR: [{ email: user.email }, { username: user.username }],
    },
  });

  if (!dbUser) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  const team = await db.team.findUnique({
    where: {
      id: user.active_team?.toString(),
    },
  });

  // Get user permissions
  const permissions = await getUserPermissions(dbUser.id);

  return (
    <WorkspaceLayout
      user={user}
      teamName={team ? team.name : user.username}
      permissions={permissions}
    >
      {children}
      <TaskCreationModal />
      <Toaster />
    </WorkspaceLayout>
  );
}
