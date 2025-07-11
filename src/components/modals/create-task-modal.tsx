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
import type { Task } from "@prisma/client";
import {
  IconCirclePlus,
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
  IconPlus,
  IconCalendar,
  IconFlag,
  IconList,
  IconBuilding,
  IconUsers,
} from "@tabler/icons-react";
import { useRef, useState, useEffect } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { api } from "@/trpc/react";
import { useToast } from "../ui/use-toast";
import { useSession } from "next-auth/react";
import { generateUUID } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  assignedTo?: string;
}

interface SubTaskData {
  id: string;
  title: string;
  content: string;
  status: string;
  isEditing?: boolean;
}

interface TeamOption {
  id: string;
  name: string;
  role: string;
  organization?: {
    id: string;
    name: string;
  } | null;
  isActive: boolean;
}

const priorityConfig = {
  "very-high": { label: "Very High", color: "bg-red-500", icon: "🔴" },
  high: { label: "High", color: "bg-orange-500", icon: "🟠" },
  middle: { label: "Medium", color: "bg-yellow-500", icon: "🟡" },
  low: { label: "Low", color: "bg-blue-500", icon: "🔵" },
  lowest: { label: "Lowest", color: "bg-gray-500", icon: "⚪" },
};

export function TaskCreationModal() {
  const { data: session } = useSession();
  const [task, setTask] = useState<TaskData>({
    id: "",
    title: "",
    content: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "",
    teamId: "",
    status: "pending",
    priority: "middle",
  });
  const [subTasks, setSubTasks] = useState<SubTaskData[]>([]);
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("");
  const [selectedAssignee, setSelectedAssignee] =
    useState<string>("unassigned");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const { toast } = useToast();
  const ref = useRef<HTMLButtonElement>(null);
  const utils = api.useUtils();

  // Get user's teams for team selection
  const { data: userTeams = [] } = api.users.getUserTeams.useQuery(undefined, {
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get team members for assignment (only when a team is selected and it's not personal)
  const { data: teamMembers = [] } = api.users.getTeamMembers.useQuery(
    { teamId: selectedTeamId },
    {
      enabled:
        !!selectedTeamId &&
        userTeams.find((t) => t.id === selectedTeamId)?.name !== "Personal",
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  );

  // Switch active team mutation
  const switchTeamMutation = api.users.switchActiveTeam.useMutation({
    onSuccess: (data) => {
      toast({
        variant: "default",
        title: "Team Switched",
        description: `Now working in ${userTeams.find((t) => t.id === data.teamId)?.name || "selected team"}`,
      });
      // Update session to reflect new active team
      utils.users.getUserTeams.invalidate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Team Switch Failed",
        description: error.message,
      });
    },
  });

  // Set initial team selection based on user's active team
  useEffect(() => {
    if (userTeams.length > 0 && !selectedTeamId) {
      const activeTeam = userTeams.find((team) => team.isActive);
      if (activeTeam) {
        setSelectedTeamId(activeTeam.id);
        setTask((prev) => ({ ...prev, teamId: activeTeam.id }));
      } else {
        // Fallback to first available team
        const firstTeam = userTeams[0];
        if (firstTeam) {
          setSelectedTeamId(firstTeam.id);
          setTask((prev) => ({ ...prev, teamId: firstTeam.id }));
        }
      }
    }
  }, [userTeams, selectedTeamId]);

  const createTaskMutation = api.tasks.createTask.useMutation({
    onSuccess: (data) => {
      toast({
        variant: "default",
        title: "Task Created! 🎉",
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
        teamId: selectedTeamId,
        status: "pending",
        priority: "middle",
      });
      setSubTasks([]);
      setNewSubtaskTitle("");
      setEditingSubtaskId(null);
      setSelectedAssignee("unassigned");
      setDueDate(undefined);
      // Invalidate and refetch tasks
      utils.tasks.getAllTasks.invalidate();
      utils.tasks.getAllSubTasks.invalidate();
      // Close the sheet
      ref.current?.click();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Creation Failed",
        description: error.message,
      });
    },
  });

  async function handleSubmit() {
    if (!task.title.trim()) {
      toast({
        variant: "destructive",
        title: "Missing Title",
        description: "Please enter a task title",
      });
      return;
    }

    if (!selectedTeamId) {
      toast({
        variant: "destructive",
        title: "No Team Selected",
        description: "Please select a team for this task",
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
        title: "Invalid Subtask",
        description: "All subtasks must have a title",
      });
      return;
    }

    createTaskMutation.mutate({
      title: task.title.trim(),
      content: task.content.trim(),
      status: task.status,
      priority: task.priority,
      teamId: selectedTeamId,
      assignedTo:
        selectedAssignee === "unassigned" ? undefined : selectedAssignee,
      dueDate: dueDate ? dueDate.toISOString() : undefined,
      subtasks: subTasks.map((subtask) => ({
        title: subtask.title.trim(),
        content: subtask.content || "",
        status: subtask.status || "pending",
      })),
    });
  }

  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
    setTask((prev) => ({ ...prev, teamId }));

    // Reset assignee when team changes
    setSelectedAssignee("unassigned");

    // Switch active team if different from current
    const currentActiveTeam = userTeams.find((team) => team.isActive);
    if (currentActiveTeam && currentActiveTeam.id !== teamId) {
      switchTeamMutation.mutate({ teamId });
    }
  };

  const addSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: SubTaskData = {
      id: generateUUID(),
      title: newSubtaskTitle.trim(),
      content: "",
      status: "pending",
    };

    setSubTasks([...subTasks, newSubtask]);
    setNewSubtaskTitle("");
  };

  const updateSubtask = (id: string, updates: Partial<SubTaskData>) => {
    setSubTasks(
      subTasks.map((st) => (st.id === id ? { ...st, ...updates } : st)),
    );
  };

  const deleteSubtask = (id: string) => {
    setSubTasks(subTasks.filter((st) => st.id !== id));
  };

  const startEditingSubtask = (id: string) => {
    setEditingSubtaskId(id);
  };

  const saveSubtaskEdit = (id: string) => {
    const subtask = subTasks.find((st) => st.id === id);
    if (subtask && subtask.title.trim()) {
      updateSubtask(id, { isEditing: false });
      setEditingSubtaskId(null);
    }
  };

  const cancelSubtaskEdit = (id: string) => {
    updateSubtask(id, { isEditing: false });
    setEditingSubtaskId(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      action();
    }
  };

  const getTeamDisplayName = (team: TeamOption) => {
    if (team.organization) {
      return `${team.organization.name} / ${team.name}`;
    }
    return team.name;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="default"
          size="lg"
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg transition-all duration-200 hover:from-blue-600 hover:to-purple-700 hover:shadow-xl"
        >
          <IconPlus size={24} className="text-white" />
        </Button>
      </SheetTrigger>
      <SheetContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <SheetHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/20">
              <IconList
                size={20}
                className="text-blue-600 dark:text-blue-400"
              />
            </div>
            <SheetTitle className="text-xl font-semibold">
              Create New Task
            </SheetTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Add a new task with details, priority, and subtasks
          </p>
        </SheetHeader>

        <div className="space-y-6 py-4">
          {/* Team Selection Section */}
          {userTeams.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <IconUsers size={18} />
                  Team Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-sm font-medium">
                    <IconBuilding size={16} />
                    Select Team
                  </Label>
                  <Select
                    value={selectedTeamId}
                    onValueChange={handleTeamChange}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose a team..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Available Teams</SelectLabel>
                        {userTeams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            <div className="flex items-center gap-2">
                              <span className="flex-1">
                                {getTeamDisplayName(team)}
                              </span>
                              {team.isActive && (
                                <Badge variant="secondary" className="text-xs">
                                  Active
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {team.role}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  {selectedTeamId && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <IconUsers size={14} />
                      <span>
                        Creating task in:{" "}
                        {(() => {
                          const team = userTeams.find(
                            (t) => t.id === selectedTeamId,
                          );
                          return team
                            ? getTeamDisplayName(team)
                            : "Unknown Team";
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Task Section */}
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
                  value={task.title}
                  onChange={(e) => setTask({ ...task, title: e.target.value })}
                  className="h-11"
                  onKeyPress={(e) => handleKeyPress(e, () => {})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-content" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="task-content"
                  placeholder="Add task description (optional)..."
                  value={task.content}
                  onChange={(e) =>
                    setTask({ ...task, content: e.target.value })
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
                    value={task.priority}
                    onValueChange={(value) =>
                      setTask({ ...task, priority: value })
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
                    value={task.status}
                    onValueChange={(value) =>
                      setTask({ ...task, status: value })
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
                <Label htmlFor="due-date" className="text-sm font-medium">
                  Select due date
                </Label>
                <div className="relative flex gap-2">
                  <Input
                    id="due-date"
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

          {/* Task Assignment Section - Only show for non-personal teams */}
          {selectedTeamId &&
            userTeams.find((t) => t.id === selectedTeamId)?.name !==
              "Personal" &&
            teamMembers.length > 0 && (
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
                        {
                          teamMembers.find((m) => m.id === selectedAssignee)
                            ?.name
                        }
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
                Subtasks ({subTasks.length})
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
              {subTasks.length > 0 && (
                <div className="space-y-2">
                  <Separator />
                  {subTasks.map((subtask, index) => (
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
                                    className="text-red-500 hover:text-red-700"
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

              {subTasks.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  <IconList size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    No subtasks yet. Add some to break down your task!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <SheetFooter className="gap-2">
          <SheetClose asChild>
            <Button variant="outline" ref={ref}>
              Cancel
            </Button>
          </SheetClose>
          <Button
            onClick={handleSubmit}
            disabled={
              createTaskMutation.isPending ||
              !task.title.trim() ||
              !selectedTeamId
            }
            className="min-w-[120px]"
          >
            {createTaskMutation.isPending ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Creating...
              </>
            ) : (
              <>
                <IconCheck size={16} className="mr-2" />
                Create Task
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
