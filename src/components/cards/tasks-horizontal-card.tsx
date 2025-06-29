"use client";
import { api } from "@/trpc/react";
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
  const utils = api.useUtils();

  const updateTaskStatusMutation = api.tasks.updateTaskStatus.useMutation({
    onSuccess: (data) => {
      toast({
        variant: "default",
        description: data.message,
      });
      // Invalidate and refetch tasks
      utils.tasks.getAllTasks.invalidate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: error.message || "Failed to update task status",
      });
    },
  });

  const updateSubtaskStatusMutation = api.tasks.updateSubtaskStatus.useMutation(
    {
      onSuccess: (data) => {
        toast({
          variant: "default",
          description: data.message,
        });
        // Invalidate and refetch subtasks
        utils.tasks.getAllSubTasks.invalidate();
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          description: error.message || "Failed to update subtask status",
        });
      },
    },
  );

  return (
    <div className="flex w-full flex-col gap-4">
      {tasks.map((task, key) => {
        const filteredSubTasks = subTasks.filter(
          (subtask) => subtask.taskId === task.id,
        );
        const numberOfSubtasks = filteredSubTasks.length;

        function changeTaskStatusClient({ status }: { status: string }) {
          updateTaskStatusMutation.mutate({ id: task.id, status });
        }

        function changeSubtaskStatusClient({
          subTaskId,
          status,
        }: {
          subTaskId: string;
          status: string;
        }) {
          updateSubtaskStatusMutation.mutate({
            id: subTaskId,
            status,
          });
        }

        return (
          <Card className={cn("flex w-full items-center px-4")} key={key}>
            <div className="flex w-full items-center">
              <CardHeader>
                <div className="flex gap-4">
                  <Checkbox
                    defaultChecked={task.status === "completed"}
                    onCheckedChange={(e) => {
                      changeTaskStatusClient({
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
                                  onCheckedChange={(e) => {
                                    const newStatus = e
                                      ? "completed"
                                      : "incomplete";

                                    changeSubtaskStatusClient({
                                      subTaskId: subtask.id,
                                      status: newStatus,
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
