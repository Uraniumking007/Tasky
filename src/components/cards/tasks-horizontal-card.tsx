"use client";
import {
  updateSubtaskStatus,
  updateTaskStatus,
  updateTask,
} from "@/app/(app)/tasks/action";
import { cn } from "@/lib/utils";
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Checkbox } from "../ui/checkbox";
import type { SubTask, Task } from "@prisma/client";
import { useToast } from "../ui/use-toast";
import { EditTaskModal } from "../modals/edit-task-modal";
import { DeleteTaskModal } from "../modals/task-delete-modal";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

export default function TasksHorizontalCard({
  tasks,
  subTasks,
}: {
  tasks: Task[];
  subTasks: SubTask[];
}) {
  const { toast } = useToast();
  return (
    <div className="flex w-full flex-col gap-4">
      {tasks.map((task, key) => {
        const filteredSubTasks = subTasks.filter(
          (subtask) => subtask.taskId === task.id,
        );
        const numberOfSubtasks = filteredSubTasks.length;

        async function changeTaskStatusClient({ status }: { status: string }) {
          const result = await updateTaskStatus({ id: task.id, status });
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

        async function changeSubtaskStatusClient({
          subTaskId,
          status,
        }: {
          subTaskId: string;
          status: string;
        }) {
          const result = await updateSubtaskStatus({
            id: subTaskId,
            status,
          });
          if (result.statusCode === 200) {
            toast({
              variant: "default",
              description: "Subtask status updated",
            });
          } else {
            toast({
              variant: "destructive",
              description: "Failed to update subtask status",
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
                {numberOfSubtasks === 0 ? (
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
                          {filteredSubTasks.map((subtask, key) => {
                            return (
                              <div className="flex gap-4 py-2" key={key}>
                                <Checkbox
                                  defaultChecked={
                                    subtask.status === "completed"
                                  }
                                  onCheckedChange={async (e) => {
                                    subtask.status = e
                                      ? "completed"
                                      : "incomplete";

                                    await changeSubtaskStatusClient({
                                      subTaskId: subtask.id,
                                      status: subtask.status,
                                    });
                                  }}
                                  id={`subtask${key}`}
                                />
                                <CardTitle>
                                  <label htmlFor={`subtask${key}`}>
                                    {subtask.title}
                                  </label>
                                </CardTitle>
                              </div>
                            );
                          })}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CardHeader>
            </div>
            <div className="flex gap-2">
              <EditTaskModal task={task} subtasks={filteredSubTasks} />
              <DeleteTaskModal id={task.id} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
