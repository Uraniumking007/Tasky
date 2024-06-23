"use client";
import { changeTaskStatus } from "@/app/(app)/tasks/action";
import { cn } from "@/lib/utils";
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import { Task } from "@prisma/client";
import { useToast } from "../ui/use-toast";

export default function TasksHorizontalCard({ tasks }: { tasks: Task[] }) {
  const { toast } = useToast();
  return (
    <div className="flex w-full flex-col gap-4">
      {tasks.map((task, key) => {
        const subtasks = JSON.parse(task.content!);
        const numberOfSubtasks = subtasks.length;

        async function changeTaskStatusClient({ status }: { status: string }) {
          const result = await changeTaskStatus({ id: task.id, status });
          if (result.statusCode === 200) {
            toast({
              variant: "default",
              description: "Task status updated",
            });
          } else {
            toast({
              variant: "destructive",
              description: "Failed to update task status",
            });
          }
        }
        return (
          <Card className={cn("flex w-full items-center px-4")} key={key}>
            <Checkbox
              defaultChecked={task.status === "completed"}
              onCheckedChange={(e) => {
                changeTaskStatusClient({
                  status: e ? "completed" : "incomplete",
                });
              }}
            />
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
  );
}
