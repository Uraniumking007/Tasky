import { CreateTaskDialog } from "@/components/modals/create-task-modal";
import React from "react";
import { getAllTasks } from "./action";
import TasksHorizontalCard from "@/components/cards/tasks-horizontal-card";

export default async function TasksPage() {
  const tasks = await getAllTasks();
  return (
    <div className="flex w-full flex-col gap-8 p-4">
      <h1>Tasks</h1>

      <TasksHorizontalCard tasks={tasks.data} />

      <CreateTaskDialog />
    </div>
  );
}
