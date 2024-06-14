import { CreateTaskDialog } from "@/components/create-task-modal";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { redirect } from "next/navigation";
import React from "react";

export default async function TasksPage() {
  const tasks = await getAllTasks();
  return (
    <div className="flex w-full flex-col gap-8 p-4">
      <h1>Tasks</h1>

      <div className="flex w-full flex-col gap-4">
        {tasks.data.map((task) => {
          const subtasks = JSON.parse(task.content!);
          const numberOfSubtasks = subtasks.length;
          return (
            <Card className={cn("flex w-full items-center px-4")}>
              <Checkbox />
              <CardHeader>
                <CardTitle>{task.title}</CardTitle>
                <CardDescription>
                  {numberOfSubtasks === 0 ? "" : `+ ${numberOfSubtasks} Tasks`}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <CreateTaskDialog />
    </div>
  );
}

async function getAllTasks() {
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
      teamId: user.active_team,
    },
  });

  return {
    data,
  };
}
