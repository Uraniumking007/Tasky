import { DashboardContainer } from "@/components/dashboard/dashboard-container";
import { getServerAuthSession } from "@/server/auth";

export default async function HomePage() {
  const user = await getServerAuthSession();
  if (!user?.user) {
    return <p>Unauthorized</p>;
  }

  return (
    <DashboardContainer
      user={{
        name: user.user.name,
        email: user.user.email,
        username: user.user.username,
      }}
    />
  );
}
