"use client";

import React from "react";
import { api } from "@/trpc/react";
import TasksHorizontalCard from "@/components/cards/tasks-horizontal-card";
import { Loader2 } from "lucide-react";

export default function TasksPage() {
  const {
    data: tasks = [],
    isLoading: tasksLoading,
    error: tasksError,
  } = api.tasks.getAllTasks.useQuery();

  const {
    data: subTasks = [],
    isLoading: subTasksLoading,
    error: subTasksError,
  } = api.tasks.getAllSubTasks.useQuery();

  if (tasksLoading || subTasksLoading) {
    return (
      <div className="flex w-full flex-col gap-8 p-4">
        <h1>Tasks</h1>
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-muted-foreground">Loading tasks...</span>
          </div>
        </div>
      </div>
    );
  }

  if (tasksError || subTasksError) {
    return (
      <div className="flex w-full flex-col gap-8 p-4">
        <h1>Tasks</h1>
        <div className="py-8 text-center">
          <h2 className="mb-2 text-lg font-semibold text-destructive">
            Failed to load tasks
          </h2>
          <p className="text-muted-foreground">
            {tasksError?.message ||
              subTasksError?.message ||
              "An error occurred while loading your tasks."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-8 p-4">
      <h1>Tasks</h1>
      <TasksHorizontalCard tasks={tasks} subTasks={subTasks} />
    </div>
  );
}
