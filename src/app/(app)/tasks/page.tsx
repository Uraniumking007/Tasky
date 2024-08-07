import React from "react";
import { getAllSubTasks, getAllTasks } from "./action";
import TasksHorizontalCard from "@/components/cards/tasks-horizontal-card";

export default async function TasksPage() {
  const tasks = await getAllTasks();
  const subTasks = await getAllSubTasks();
  return (
    <div className="flex w-full flex-col gap-8 p-4">
      <h1>Tasks</h1>
      <TasksHorizontalCard tasks={tasks.data} subTasks={subTasks.data} />
    </div>
  );
}
