import { CreateTaskDialog } from "@/components/create-task-modal";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { redirect } from "next/navigation";
import React from "react";

export default async function TasksPage() {
  const tasks = await getAllTasks();
  console.log(tasks);
  return (
    <div>
      <h1>Tasks</h1>
      <p>Welcome to the tasks page.</p>
      {JSON.stringify(tasks)}
      <CreateTaskDialog />
    </div>
  );
}

export async function getAllTasks() {
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/login");
  }

  const user = await db.user.findUnique({
    where: {
      username: session.user.username,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const data = await db.task.findMany({
    where: {
      id: user.id,
    },
  });
  return {
    ...data,
  };
}
