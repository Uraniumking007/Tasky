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
import type { SubTask, Task } from "@prisma/client";
import {
  IconCirclePlus,
  IconDeviceFloppy,
  IconTrash,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  addSubtask,
  deleteSubtask,
  updateTask,
  type TaskData,
} from "@/app/(app)/tasks/action";
import { useToast } from "../ui/use-toast";
import { Pencil } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface EditSubtaskType {
  id: string;
  title: string;
  isSaved: boolean;
}

export function EditTaskModal({
  task,
  subtasks,
}: {
  task: Task;
  subtasks: SubTask[];
}) {
  const [editedTask, setEditedTask] = useState<TaskData>({
    ...task,
    content: task.content ?? "",
  });
  const [editedSubTasks, setEditedSubTasks] = useState<EditSubtaskType[]>(
    subtasks.map((subtask) => ({ ...subtask, isSaved: true })),
  );
  const [subTaskCount, setSubTaskCount] = useState(subtasks.length);

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
    try {
      await updateTask({ id: task.id, taskData: editedTask });
      toast({
        variant: "default",
        title: "Success",
        description: "Task Edited successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: JSON.stringify(error),
      });
    }
  }

  const handleSubTaskChange = (index: number, title: string) => {
    const newSubTasks = editedSubTasks.map((subtask, i) =>
      i === index ? { ...subtask, title } : subtask,
    );
    setEditedSubTasks(newSubTasks);
  };

  const handleSaveSubTask = async (index: number) => {
    const newSubTasks = editedSubTasks.map((subtask, i) =>
      i === index ? { ...subtask, isSaved: true } : subtask,
    );

    for (const editedSubTask of editedSubTasks) {
      if (!editedSubTask.title || editedSubTask.title == "") {
        throw new Error("Subtask title cannot be empty");
      }
      if (!editedSubTask.isSaved) {
        try {
          await addSubtask({
            subtask: {
              title: editedSubTask.title,
              taskId: task.id,
              id: editedSubTask.id,
              content: null,
              status: "incomplete",
              user_id: "",
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          });
          toast({
            variant: "default",
            title: "Success",
            description: "SubTask created successfully",
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Error",
            description: JSON.stringify(error),
          });
        }
      }
    }

    setEditedSubTasks(newSubTasks);
  };

  const addNewSubTask = () => {
    setEditedSubTasks([
      ...editedSubTasks,
      { id: crypto.randomUUID(), title: "", isSaved: false },
    ]);
    setSubTaskCount(subTaskCount + 1);
  };

  async function deleteSubTask(id: string) {
    const newSubTasks = editedSubTasks.filter(
      (subtask, index) => subtask.id !== id,
    );
    setSubTaskCount(subTaskCount - 1);
    try {
      await deleteSubtask({ id });
      toast({
        variant: "default",
        title: "Success",
        description: "SubTask deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: JSON.stringify(error),
      });
    }
    setEditedSubTasks(newSubTasks);
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full p-2">
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
            {subTaskCount === 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <IconCirclePlus
                      className="h-6 w-6"
                      onClick={addNewSubTask}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>New SubTask</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {editedSubTasks.map((subtask, index) => {
            return (
              <div className="flex items-center gap-2" key={subtask.id}>
                <Label htmlFor="subtask" className="text-nowrap text-right">
                  {`SubTask ${index + 1}`}
                </Label>
                <Input
                  id="subtask"
                  className="col-span-3"
                  defaultValue={subtask.title ?? ""}
                  onChange={(e) => handleSubTaskChange(index, e.target.value)}
                />
                {editedSubTasks.length === index + 1 && (
                  <TooltipProvider>
                    {subtask.isSaved ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <IconCirclePlus
                            className="h-6 w-6"
                            onClick={addNewSubTask}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>New SubTask</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <IconDeviceFloppy
                            className="h-6 w-6"
                            onClick={() => handleSaveSubTask(index)}
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Save SubTask</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </TooltipProvider>
                )}
                {subtask.isSaved && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <IconTrash
                          className="h-6 w-6"
                          onClick={() => deleteSubTask(subtask.id)}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Delete SubTask</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            );
          })}
          <Select
            defaultValue={editedTask.priority}
            onValueChange={(event) => {
              setEditedTask({ ...editedTask, priority: event });
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
