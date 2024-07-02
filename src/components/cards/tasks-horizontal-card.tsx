"use client";
import { changeTaskStatus, updateTask } from "@/app/(app)/tasks/action";
import { cn } from "@/lib/utils";
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import type { Task } from "@prisma/client";
import { useToast } from "../ui/use-toast";
import { EditTaskModal } from "../modals/edit-task-modal";
import { DeleteTaskModal } from "../modals/task-delete-modal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export default function TasksHorizontalCard({ tasks }: { tasks: Task[] }) {
  const { toast } = useToast();
  return (
    <div className="flex w-full flex-col gap-4">
      {tasks.map((task, key) => {
        // const subtasks = JSON.parse(task.content!) as {
        //   title: string;
        //   status: string;
        // }[];
        // const numberOfSubtasks = subtasks.length;

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
            <div className="flex w-full items-center">
              <CardHeader>
                <div className="flex gap-4">
                  <Checkbox
                    defaultChecked={task.status === "completed"}
                    onCheckedChange={async (e) => {
                      await changeTaskStatusClient({
                        status: e ? "completed" : "incomplete",
                      });
                    }}
                  />
                  <CardTitle>{task.title}</CardTitle>
                </div>
                {/* {numberOfSubtasks === 0 ? (
                  ""
                ) : (
                  <Accordion type="single" collapsible className="ml-8">
                    <AccordionItem value={`${key}`}>
                      <AccordionTrigger>
                        <CardDescription>
                          {numberOfSubtasks} Tasks
                        </CardDescription>
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="list-inside list-disc">
                          {subtasks.map((subtask, key) => {
                            return (
                              <div className="flex gap-4 py-2">
                                <Checkbox
                                  defaultChecked={
                                    subtask.status === "completed"
                                  }
                                  onCheckedChange={async (e) => {
                                    subtask.status = e
                                      ? "completed"
                                      : "incomplete";

                                    await updateTask({
                                      id: task.id,
                                      taskData: {
                                        ...task,
                                        content: task.content as string,
                                      },
                                    });
                                  }}
                                />
                                <CardTitle>{subtask.title}</CardTitle>
                              </div>
                            );
                          })}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )} */}
              </CardHeader>
            </div>
            <div className="flex gap-2">
              <EditTaskModal task={task} />
              <DeleteTaskModal id={task.id} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
