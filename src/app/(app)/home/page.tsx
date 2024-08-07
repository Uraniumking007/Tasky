import AllTasksListTable from "@/components/tables/all-tasks-table";
import { getAllSubTasks, getAllTasks } from "../tasks/action";
import { ifError } from "assert";
import { useSession } from "next-auth/react";
import { getServerAuthSession } from "@/server/auth";

export default async function HomePage() {
  const user = await getServerAuthSession();
  if (!user?.user) {
    return <p>Unauthorized</p>;
  }

  const tasks = await getAllTasks();
  const subTasks = await getAllSubTasks();

  return (
    <div className="m-2 w-full rounded-sm  p-4">
      <h1 className="text-3xl font-black">Welcome Back</h1>
      <p className="font-normal">Here's List of All Your Tasks.</p>
      <AllTasksListTable tasks={tasks.data} subtasks={subTasks.data} />
    </div>
  );
}
