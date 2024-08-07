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
    <div className="m-2 flex w-full flex-col justify-center rounded-sm p-4">
      <h1 className="text-3xl font-black">Welcome Back</h1>
      <p className="font-normal">Here's List of All Your Tasks.</p>
      {tasks.data.length === 0 ? (
        <div className="flex h-full w-full flex-col items-center justify-center">
          <iframe
            src="https://lottie.host/embed/c8b76e8b-c33e-4afb-b8b6-6493a02cc2c6/JpXj66hdGo.json"
            className="h-3/5 w-3/5"
          />
          <p>No tasks found</p>
        </div>
      ) : (
        <div className="h-full w-full">
          <AllTasksListTable tasks={tasks.data} subtasks={subTasks.data} />
        </div>
      )}
    </div>
  );
}
