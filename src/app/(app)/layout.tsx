import { TaskCreationModal } from "@/components/modals/create-task-modal";
import SideNavbar from "@/components/side-navbar";
import { auth } from "@/server/auth";
import { db } from "@/server/db";
import type { User } from "next-auth";
import { type ReactNode } from "react";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  const user = session?.user as User; // Cast the user object to the User type
  const team = await db.team.findUnique({
    where: {
      id: user.active_team?.toString(),
    },
  });

  if (!session?.user) {
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }

  return (
    <div className="flex w-full">
      <SideNavbar
        user={user}
        teamName={team ? team.name : user.username || ""}
      />
      {children}
      <TaskCreationModal />
    </div>
  );
}
