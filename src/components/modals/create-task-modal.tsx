"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Task } from "@prisma/client";
import { IconCirclePlus } from "@tabler/icons-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { type TaskData, createTask } from "@/app/(app)/tasks/action";
import { useToast } from "../ui/use-toast";

export function CreateTaskDialog() {
  const [task, setTask] = useState<TaskData>({
    title: "",
    content: "",
    createdAt: new Date(),
    status: "pending",
  });
  const [subTask, setSubTask] = useState<Partial<Task>[]>([]);
  const [subTaskCount, setSubTaskCount] = useState("0");
  const { toast } = useToast();
  async function handleSubmit() {
    if (task.title === "") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Task title cannot be empty",
      });
      return;
    }
    const newTask = {
      ...task,
      content: JSON.stringify(subTask),
    };
    try {
      await createTask({ taskData: newTask });
      toast({
        variant: "default",
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error) {
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: JSON.stringify(error),
        });
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="fixed bottom-10 right-10 h-16 w-16 rounded-full"
        >
          <IconCirclePlus size={258} className="h-full w-full" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Task</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Title
            </Label>
            <Input
              id="task"
              defaultValue=""
              onChange={(e) => setTask({ ...task, title: e.target.value })}
              className="col-span-3"
            />
            {subTaskCount === "0" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <IconCirclePlus
                      className="h-6 w-6"
                      onClick={() => {
                        setSubTaskCount(
                          (parseInt(subTaskCount) + 1).toString(),
                        );
                        setSubTask([
                          ...subTask,
                          {
                            id: "0",
                            title: "",
                            createdAt: new Date(),
                            status: "pending",
                          },
                        ]);
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>New SubTask</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {subTask.map((subtask, index) => (
            <div className="grid grid-cols-5 items-center gap-2" key={index}>
              <Label htmlFor="username" className="text-right">
                {`SubTask ${index + 1}`}
              </Label>
              <Input
                id="subtask"
                className="col-span-3"
                defaultValue={subtask.title ?? ""}
                onChange={(e) => {
                  const newSubTask = [...subTask];
                  newSubTask.map((sub, i) => {
                    if (i === index) {
                      sub.title = e.target.value;
                    }
                  });
                  setSubTask(newSubTask);
                }}
              />
              {subTaskCount === (index + 1).toString() &&
                (subTask ?? []).length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <IconCirclePlus
                          className="h-6 w-6"
                          onClick={() => {
                            setSubTaskCount(
                              (parseInt(subTaskCount) + 1).toString(),
                            );
                            setSubTask([
                              ...subTask,
                              {
                                id: "0",
                                title: "",
                                createdAt: new Date(),
                                status: "pending",
                              },
                            ]);
                          }}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>New SubTask</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={async () => {
              await handleSubmit();
            }}
          >
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
