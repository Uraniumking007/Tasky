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
import { useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { updateTask, type TaskData } from "@/app/(app)/tasks/action";
import { useToast } from "../ui/use-toast";
import { Pencil } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";

export function EditTaskModal({ task }: { task: Task }) {
  const [editedTask, setEditedTask] = useState<TaskData>({
    ...task,
    content: task.content ?? "",
  });
  const [editedSubTask, editedSetSubTask] = useState<Partial<Task>[]>(
    JSON.parse(task.content ?? ""),
  );
  const [subTaskCount, setSubTaskCount] = useState(
    editedSubTask.length.toString(),
  );
  const { toast } = useToast();
  const ref = useRef<HTMLButtonElement>(null);

  async function handleSubmit() {
    if (editedTask.title === "") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Task title cannot be empty",
      });
      return;
    }
    const newTask = {
      ...editedTask,
      content: JSON.stringify(editedSubTask),
    };
    try {
      await updateTask({ id: task.id, taskData: newTask });
      toast({
        variant: "default",
        title: "Success",
        description: "Task Edited successfully",
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
          variant={"secondary"}
          size={"icon"}
          className="rounded-full p-2"
        >
          <Pencil size={32} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-5 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Title
            </Label>
            <Input
              id="task"
              defaultValue={editedTask.title ?? ""}
              onChange={(e) =>
                setEditedTask({ ...editedTask, title: e.target.value })
              }
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
                        editedSetSubTask([
                          ...editedSubTask,
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
          {editedSubTask.map((subtask, index) => (
            <div className="grid grid-cols-5 items-center gap-2" key={index}>
              <Label htmlFor="username" className="text-right">
                {`SubTask ${index + 1}`}
              </Label>
              <Input
                id="subtask"
                className="col-span-3"
                defaultValue={subtask.title ?? ""}
                onChange={(e) => {
                  const newSubTask = [...editedSubTask];
                  newSubTask.map((sub, i) => {
                    if (i === index) {
                      sub.title = e.target.value;
                    }
                  });
                  editedSetSubTask(newSubTask);
                }}
              />
              {subTaskCount === (index + 1).toString() &&
                (editedSubTask ?? []).length > 0 && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <IconCirclePlus
                          className="h-6 w-6"
                          onClick={() => {
                            setSubTaskCount(
                              (parseInt(subTaskCount) + 1).toString(),
                            );
                            editedSetSubTask([
                              ...editedSubTask,
                              {
                                id: subTaskCount.toString(),
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
