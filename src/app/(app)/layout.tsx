import { TaskCreationModal } from "@/components/modals/create-task-modal";
import WorkspaceLayout from "@/components/workspace-layout";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { Toaster } from "@/components/ui/toaster";
import type { User } from "next-auth";
import { type ReactNode } from "react";
import { redirect } from "next/navigation";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const user = session?.user as User;

  // Get user from database
  const dbUser = await db.users.findFirst({
    where: {
      OR: [{ email: user.email }, { username: user.username }],
    },
  });

  if (!dbUser) {
    redirect("/auth/login");
  }

  return (
    <WorkspaceLayout
      user={{
        ...session.user,
        id: dbUser.id,
        active_team: dbUser.active_team,
      }}
      organizations={[]}
    >
      {children}
      <TaskCreationModal />
      <Toaster />
    </WorkspaceLayout>
  );
}
