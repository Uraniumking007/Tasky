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
import { api } from "@/trpc/react";

type TaskData = {
  title: string;
  content: string;
  status: string;
  priority: string;
};
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
  isNew: boolean; // Track if this is a new subtask
  originalTitle?: string; // Track original title for comparison
  isEditing?: boolean; // Track if this subtask is being edited inline
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
    subtasks.map((subtask) => ({
      ...subtask,
      isSaved: true,
      isNew: false,
      originalTitle: subtask.title,
    })),
  );
  const [subTaskCount, setSubTaskCount] = useState(subtasks.length);

  const { toast } = useToast();
  const ref = useRef<HTMLButtonElement>(null);
  const utils = api.useUtils();

  const updateTaskMutation = api.tasks.updateTask.useMutation({
    onSuccess: (data) => {
      toast({
        variant: "default",
        title: "Success",
        description: data.message,
      });
      utils.tasks.getAllTasks.invalidate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const addSubtaskMutation = api.tasks.addSubtask.useMutation({
    onSuccess: (data) => {
      toast({
        variant: "default",
        title: "Success",
        description: data.message,
      });
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

  const updateSubtaskMutation = api.tasks.updateSubtask.useMutation({
    onSuccess: (data) => {
      toast({
        variant: "default",
        title: "Success",
        description: data.message,
      });
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

  const deleteSubtaskMutation = api.tasks.deleteSubtask.useMutation({
    onSuccess: (data) => {
      toast({
        variant: "default",
        title: "Success",
        description: data.message,
      });
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

  function handleSubmit() {
    if (editedTask.title === "") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Task title cannot be empty",
      });
      return;
    }

    updateTaskMutation.mutate({
      id: task.id,
      title: editedTask.title,
      content: editedTask.content,
      status: editedTask.status,
      priority: editedTask.priority,
    });
  }

  const handleSubTaskChange = (index: number, title: string) => {
    const newSubTasks = editedSubTasks.map((subtask, i) =>
      i === index ? { ...subtask, title } : subtask,
    );
    setEditedSubTasks(newSubTasks);
  };

  const handleSaveSubTask = async (index: number) => {
    const subtask = editedSubTasks[index];

    if (!subtask) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Subtask not found",
      });
      return;
    }

    if (!subtask.title || subtask.title.trim() === "") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Subtask title cannot be empty",
      });
      return;
    }

    try {
      if (subtask.isNew) {
        // Create new subtask
        await addSubtaskMutation.mutateAsync({
          taskId: task.id,
          title: subtask.title.trim(),
          content: "",
          status: "incomplete",
        });
      } else {
        // Update existing subtask if title changed
        if (subtask.title !== subtask.originalTitle) {
          await updateSubtaskMutation.mutateAsync({
            id: subtask.id,
            title: subtask.title.trim(),
            content: "",
            status: "incomplete",
          });
        }
      }

      // Mark as saved
      const newSubTasks = editedSubTasks.map((st, i) =>
        i === index
          ? { ...st, isSaved: true, isNew: false, originalTitle: st.title }
          : st,
      );
      setEditedSubTasks(newSubTasks);
    } catch (error) {
      console.error("Error saving subtask:", error);
    }
  };

  const addNewSubTask = () => {
    setEditedSubTasks([
      ...editedSubTasks,
      {
        id: crypto.randomUUID(),
        title: "",
        isSaved: false,
        isNew: true,
      },
    ]);
    setSubTaskCount(subTaskCount + 1);
  };

  const startEditingSubtask = (index: number) => {
    const newSubTasks = editedSubTasks.map((st, i) =>
      i === index ? { ...st, isEditing: true } : st,
    );
    setEditedSubTasks(newSubTasks);
  };

  const cancelEditingSubtask = (index: number) => {
    const newSubTasks = editedSubTasks.map((st, i) =>
      i === index
        ? { ...st, isEditing: false, title: st.originalTitle || st.title }
        : st,
    );
    setEditedSubTasks(newSubTasks);
  };

  const saveEditingSubtask = async (index: number) => {
    const subtask = editedSubTasks[index];

    if (!subtask) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Subtask not found",
      });
      return;
    }

    if (!subtask.title || subtask.title.trim() === "") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Subtask title cannot be empty",
      });
      return;
    }

    try {
      if (subtask.isNew) {
        // Create new subtask
        await addSubtaskMutation.mutateAsync({
          taskId: task.id,
          title: subtask.title.trim(),
          content: "",
          status: "incomplete",
        });
      } else {
        // Update existing subtask if title changed
        if (subtask.title !== subtask.originalTitle) {
          await updateSubtaskMutation.mutateAsync({
            id: subtask.id,
            title: subtask.title.trim(),
            content: "",
            status: "incomplete",
          });
        }
      }

      // Mark as saved and stop editing
      const newSubTasks = editedSubTasks.map((st, i) =>
        i === index
          ? {
              ...st,
              isSaved: true,
              isNew: false,
              isEditing: false,
              originalTitle: st.title,
            }
          : st,
      );
      setEditedSubTasks(newSubTasks);
    } catch (error) {
      console.error("Error saving subtask:", error);
    }
  };

  function deleteSubTask(id: string) {
    const subtask = editedSubTasks.find((st) => st.id === id);
    const newSubTasks = editedSubTasks.filter((st) => st.id !== id);
    setSubTaskCount(subTaskCount - 1);

    // Only call delete API if it's a saved subtask (not a new one)
    if (subtask && !subtask.isNew) {
      deleteSubtaskMutation.mutate({ id });
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
          {editedSubTasks.map((subtask, _index) => {
            return (
              <div className="flex items-center gap-2" key={subtask.id}>
                <Label htmlFor="subtask" className="text-nowrap text-right">
                  {`SubTask ${_index + 1}`}
                </Label>
                <Input
                  id="subtask"
                  className="col-span-3"
                  defaultValue={subtask.title ?? ""}
                  onChange={(e) => handleSubTaskChange(_index, e.target.value)}
                />
                {editedSubTasks.length === _index + 1 && (
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
                            onClick={() => handleSaveSubTask(_index)}
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
