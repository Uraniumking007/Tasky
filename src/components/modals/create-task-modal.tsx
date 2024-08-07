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
import { type TaskData, createNewTask } from "@/app/(app)/tasks/action";
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
    };
    try {
      subTasks.forEach((subtask) => {
        if (!subtask.title || subtask.title == "") {
          throw new Error("Subtask title cannot be empty");
        }
      });
      await createNewTask({ taskData: newTask, subtasks: subTasks });
      toast({
        variant: "default",
        title: "Success",
        description: "Task created successfully",
      });
    } catch (error) {
      const typedError = error as Error;
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: typedError.message
            ? typedError.message
            : JSON.stringify(error),
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
              ref.current?.click();
            }}
          >
            Save changes
          </Button>
          <DialogClose ref={ref} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
