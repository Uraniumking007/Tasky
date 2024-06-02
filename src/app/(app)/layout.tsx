import Navbar from "@/components/navbar";
import SideNavbar from "@/components/side-navbar";
import { getServerAuthSession } from "@/server/auth";
import { User } from "next-auth";
import { ReactNode } from "react";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getServerAuthSession();
  const user = session?.user as User; // Cast the user object to the User type

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
      <SideNavbar user={user} />
      {children}
    </div>
  );
}
