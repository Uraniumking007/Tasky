"use client";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
  IconPlus,
  IconCalendar,
  IconFlag,
  IconList,
  IconUsers,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { api } from "@/trpc/react";
import { Task, SubTask } from "@prisma/client";
import { useToast } from "../ui/use-toast";
import { Pencil } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { v4 as uuidv4 } from "uuid";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

type TaskData = {
  title: string;
  content: string;
  status: string;
  priority: string;
  assignedTo?: string;
};

interface EditSubtaskType {
  id: string;
  title: string;
  isSaved: boolean;
  isNew: boolean;
  originalTitle?: string;
  isEditing?: boolean;
}

const priorityConfig = {
  "very-high": { label: "Very High", color: "bg-red-500", icon: "🔴" },
  high: { label: "High", color: "bg-orange-500", icon: "🟠" },
  middle: { label: "Medium", color: "bg-yellow-500", icon: "🟡" },
  low: { label: "Low", color: "bg-blue-500", icon: "🔵" },
  lowest: { label: "Lowest", color: "bg-gray-500", icon: "⚪" },
};

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
    assignedTo: task.assignedTo ?? undefined,
  });
  const [editedSubTasks, setEditedSubTasks] = useState<EditSubtaskType[]>(
    subtasks.map((subtask) => ({
      ...subtask,
      isSaved: true,
      isNew: false,
      originalTitle: subtask.title,
    })),
  );
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [selectedAssignee, setSelectedAssignee] = useState<string>(
    task.assignedTo || "unassigned",
  );
  const [dueDate, setDueDate] = useState<Date | undefined>(
    task.dueDate ? new Date(task.dueDate) : undefined,
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const { toast } = useToast();
  const ref = useRef<HTMLButtonElement>(null);
  const utils = api.useUtils();

  // Get team members for assignment (only when task has a team and it's not personal)
  const { data: teamMembers = [] } = api.users.getTeamMembers.useQuery(
    { teamId: task.teamId || "" },
    {
      enabled: !!task.teamId,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  );

  const updateTaskMutation = api.tasks.updateTask.useMutation({
    onSuccess: (data) => {
      toast({
        variant: "default",
        title: "Task Updated! 🎉",
        description: data.message,
      });
      utils.tasks.getAllTasks.invalidate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    },
  });

  const addSubtaskMutation = api.tasks.addSubtask.useMutation({
    onSuccess: (data) => {
      toast({
        variant: "default",
        title: "Subtask Added! ✨",
        description: data.message,
      });
      utils.tasks.getAllSubTasks.invalidate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Add Failed",
        description: error.message,
      });
    },
  });

  const updateSubtaskMutation = api.tasks.updateSubtask.useMutation({
    onSuccess: (data) => {
      toast({
        variant: "default",
        title: "Subtask Updated! ✨",
        description: data.message,
      });
      utils.tasks.getAllSubTasks.invalidate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      });
    },
  });

  const deleteSubtaskMutation = api.tasks.deleteSubtask.useMutation({
    onSuccess: (data) => {
      toast({
        variant: "default",
        title: "Subtask Deleted! 🗑️",
        description: data.message,
      });
      utils.tasks.getAllSubTasks.invalidate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error.message,
      });
    },
  });

  async function handleSubmit() {
    if (!editedTask.title.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Title",
        description: "Please enter a task title",
      });
      return;
    }

    updateTaskMutation.mutate({
      id: task.id,
      title: editedTask.title.trim(),
      content: editedTask.content.trim(),
      status: editedTask.status,
      priority: editedTask.priority,
      assignedTo:
        selectedAssignee === "unassigned" ? undefined : selectedAssignee,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
    });
  }

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: EditSubtaskType = {
      id: uuidv4(),
      title: newSubtaskTitle.trim(),
      isSaved: false,
      isNew: true,
    };

    setEditedSubTasks([...editedSubTasks, newSubtask]);
    setNewSubtaskTitle("");
  };

  const updateSubtask = (id: string, updates: Partial<EditSubtaskType>) => {
    setEditedSubTasks(
      editedSubTasks.map((st) => (st.id === id ? { ...st, ...updates } : st)),
    );
  };

  const deleteSubtask = (id: string) => {
    const subtask = editedSubTasks.find((st) => st.id === id);
    const newSubTasks = editedSubTasks.filter((st) => st.id !== id);

    // Only call delete API if it's a saved subtask (not a new one)
    if (subtask && !subtask.isNew) {
      deleteSubtaskMutation.mutate({ id });
    }

    setEditedSubTasks(newSubTasks);
  };

  const startEditingSubtask = (id: string) => {
    setEditingSubtaskId(id);
  };

  const saveSubtaskEdit = async (id: string) => {
    const subtask = editedSubTasks.find((st) => st.id === id);
    if (!subtask) return;

    if (!subtask.title.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Title",
        description: "Subtask title cannot be empty",
      });
      return;
    }

    try {
      if (subtask.isNew) {
        await addSubtaskMutation.mutateAsync({
          taskId: task.id,
          title: subtask.title.trim(),
          content: "",
          status: "pending",
        });
      } else if (subtask.title !== subtask.originalTitle) {
        await updateSubtaskMutation.mutateAsync({
          id: subtask.id,
          title: subtask.title.trim(),
          content: "",
          status: "pending",
        });
      }

      updateSubtask(id, {
        isSaved: true,
        isNew: false,
        originalTitle: subtask.title,
      });
      setEditingSubtaskId(null);
    } catch (error) {
      console.error("Error saving subtask:", error);
    }
  };

  const cancelSubtaskEdit = (id: string) => {
    const subtask = editedSubTasks.find((st) => st.id === id);
    if (subtask) {
      updateSubtask(id, {
        title: subtask.originalTitle || subtask.title,
        isEditing: false,
      });
    }
    setEditingSubtaskId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full p-2">
          <Pencil size={16} />
        </Button>
      </SheetTrigger>
      <SheetContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <SheetHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
              <IconEdit
                size={20}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
            <SheetTitle className="text-xl font-semibold">Edit Task</SheetTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Update task details, priority, assignment, and subtasks
          </p>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Task Details Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconEdit size={18} />
                Task Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-title" className="text-sm font-medium">
                  Task Title *
                </Label>
                <Input
                  id="task-title"
                  placeholder="Enter task title..."
                  value={editedTask.title}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, title: e.target.value })
                  }
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-content" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="task-content"
                  placeholder="Add task description (optional)..."
                  value={editedTask.content}
                  onChange={(e) =>
                    setEditedTask({ ...editedTask, content: e.target.value })
                  }
                  className="min-h-[80px] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <IconFlag size={16} />
                    Priority
                  </Label>
                  <Select
                    value={editedTask.priority}
                    onValueChange={(value) =>
                      setEditedTask({ ...editedTask, priority: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Select Priority</SelectLabel>
                        {Object.entries(priorityConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-2">
                              <span>{config.icon}</span>
                              <span>{config.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <IconCalendar size={16} />
                    Status
                  </Label>
                  <Select
                    value={editedTask.status}
                    onValueChange={(value) =>
                      setEditedTask({ ...editedTask, status: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Select Status</SelectLabel>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Assignment Section - Only show for non-personal teams */}
          {task.teamId && teamMembers.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconUsers size={18} />
                  Assign Task
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <IconUsers size={16} />
                    Assign to Team Member
                  </Label>
                  <Select
                    value={selectedAssignee}
                    onValueChange={setSelectedAssignee}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select team member (optional)..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Team Members</SelectLabel>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {teamMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            <div className="flex items-center gap-2">
                              <span className="flex-1">{member.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {member.role}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {selectedAssignee && selectedAssignee !== "unassigned" && (
                    <p className="text-xs text-muted-foreground">
                      Task will be assigned to{" "}
                      {teamMembers.find((m) => m.id === selectedAssignee)?.name}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subtasks Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <IconList size={18} />
                Subtasks ({editedSubTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Subtask */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add a subtask..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addSubtask)}
                  className="flex-1"
                />
                <Button
                  onClick={addSubtask}
                  disabled={!newSubtaskTitle.trim()}
                  size="sm"
                  className="px-4"
                >
                  <IconPlus size={16} />
                </Button>
              </div>

              {/* Subtasks List */}
              {editedSubTasks.length > 0 && (
                <div className="space-y-2">
                  <Separator />
                  {editedSubTasks.map((subtask, index) => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
                    >
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>

                      {editingSubtaskId === subtask.id ? (
                        <div className="flex flex-1 gap-2">
                          <Input
                            value={subtask.title}
                            onChange={(e) =>
                              updateSubtask(subtask.id, {
                                title: e.target.value,
                              })
                            }
                            onKeyPress={(e) =>
                              handleKeyPress(e, () =>
                                saveSubtaskEdit(subtask.id),
                              )
                            }
                            className="flex-1"
                            autoFocus
                          />
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => saveSubtaskEdit(subtask.id)}
                            disabled={!subtask.title.trim()}
                          >
                            <IconCheck size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => cancelSubtaskEdit(subtask.id)}
                          >
                            <IconX size={16} />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className="flex-1 text-sm">
                            {subtask.title}
                          </span>
                          <div className="flex gap-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      startEditingSubtask(subtask.id)
                                    }
                                  >
                                    <IconEdit size={14} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Edit subtask</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteSubtask(subtask.id)}
                                  >
                                    <IconTrash size={14} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete subtask</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Due Date Section */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarIcon size={18} />
                Due Date
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                <Label htmlFor="due-date-edit" className="text-sm font-medium">
                  Select due date
                </Label>
                <div className="relative flex gap-2">
                  <Input
                    id="due-date-edit"
                    value={dueDate ? format(dueDate, "PPPP") : ""}
                    placeholder="Select a due date..."
                    className="bg-background pr-10"
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      if (!isNaN(date.getTime())) {
                        setDueDate(date);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setIsDatePickerOpen(true);
                      }
                    }}
                  />
                  <Popover
                    open={isDatePickerOpen}
                    onOpenChange={setIsDatePickerOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="absolute right-2 top-1/2 size-6 -translate-y-1/2"
                      >
                        <CalendarIcon className="size-3.5" />
                        <span className="sr-only">Select date</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto overflow-hidden p-0"
                      align="end"
                      alignOffset={-8}
                      sideOffset={10}
                    >
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                          setDueDate(date);
                          setIsDatePickerOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <SheetFooter>
          <Button
            type="submit"
            onClick={async () => {
              await handleSubmit();
              ref.current?.click();
            }}
            disabled={updateTaskMutation.isPending}
          >
            {updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
          <SheetClose ref={ref} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
