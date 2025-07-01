import { TaskCreationModal } from "@/components/modals/create-task-modal";
import WorkspaceLayout from "@/components/workspace-layout";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { Toaster } from "@/components/ui/toaster";
import type { User } from "next-auth";
import { type ReactNode } from "react";

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

  const user = session?.user as User;

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

  return (
    <WorkspaceLayout
      user={{
        name: session.user.name || "",
        email: session.user.email || "",
        username: session.user.username || "",
      }}
      organizations={[]}
    >
      {children}
      <TaskCreationModal />
      <Toaster />
    </WorkspaceLayout>
  );
}
