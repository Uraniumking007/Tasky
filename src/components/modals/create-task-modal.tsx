"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
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
import { useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { api } from "@/trpc/react";
import { useToast } from "../ui/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface TaskData {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  teamId: string;
  status: string;
  priority: string;
}

export function TaskCreationModal() {
  const [task, setTask] = useState<TaskData>({
    id: "",
    title: "",
    content: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "",
    teamId: "",
    status: "pending",
    priority: "low",
  });
  const [subTasks, setSubTasks] = useState<Partial<Task>[]>([]);
  const [subTaskCount, setSubTaskCount] = useState("0");
  const { toast } = useToast();
  const ref = useRef<HTMLButtonElement>(null);
  const utils = api.useUtils();

  const createTaskMutation = api.tasks.createTask.useMutation({
    onSuccess: (data) => {
      toast({
        variant: "default",
        title: "Success",
        description: data.message,
      });
      // Reset form
      setTask({
        id: "",
        title: "",
        content: "",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: "",
        teamId: "",
        status: "pending",
        priority: "low",
      });
      setSubTasks([]);
      setSubTaskCount("0");
      // Invalidate and refetch tasks
      utils.tasks.getAllTasks.invalidate();
      utils.tasks.getAllSubTasks.invalidate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  async function handleSubmit() {
    if (task.title === "") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Task title cannot be empty",
      });
      return;
    }

    // Validate subtasks
    const invalidSubtask = subTasks.find(
      (subtask) => !subtask.title || subtask.title.trim() === "",
    );
    if (invalidSubtask) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Subtask title cannot be empty",
      });
      return;
    }

    createTaskMutation.mutate({
      title: task.title,
      content: task.content,
      status: task.status,
      priority: task.priority,
      subtasks: subTasks.map((subtask) => ({
        title: subtask.title || "",
        content: subtask.content || "",
        status: subtask.status || "pending",
      })),
    });
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
                        setSubTasks([
                          ...subTasks,
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
          {subTasks.map((subtask, index) => (
            <div className="grid grid-cols-5 items-center gap-2" key={index}>
              <Label htmlFor="username" className="text-right">
                {`SubTask ${index + 1}`}
              </Label>
              <Input
                id="subtask"
                className="col-span-3"
                defaultValue={subtask.title ?? ""}
                onChange={(e) => {
                  const newSubTask = [...subTasks];
                  newSubTask.map((sub, i) => {
                    if (i === index) {
                      sub.title = e.target.value;
                    }
                  });
                  setSubTasks(newSubTask);
                }}
              />
              {subTaskCount === (index + 1).toString() &&
                (subTasks ?? []).length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <IconCirclePlus
                          className="h-6 w-6"
                          onClick={() => {
                            setSubTaskCount(
                              (parseInt(subTaskCount) + 1).toString(),
                            );
                            setSubTasks([
                              ...subTasks,
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
          <Select
            defaultValue={task.priority}
            onValueChange={(event) => {
              setTask({ ...task, priority: event });
            }}
          >
            <SelectTrigger className="mx-auto w-4/5">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Priority</SelectLabel>
                <SelectItem value="very-high">Very High</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="middle">Middle</SelectItem>
                <SelectItem value="low">low</SelectItem>
                <SelectItem value="lowest">Lowest</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={async () => {
              await handleSubmit();
              if (!createTaskMutation.isPending) {
                ref.current?.click();
              }
            }}
            disabled={createTaskMutation.isPending}
          >
            {createTaskMutation.isPending ? "Creating..." : "Save changes"}
          </Button>
          <DialogClose ref={ref} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
