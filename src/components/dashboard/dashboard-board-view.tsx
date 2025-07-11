"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconPlus,
  IconList,
  IconArrowRight,
} from "@tabler/icons-react";
import Link from "next/link";

interface DashboardBoardViewProps {
  tasks: any[];
  subTasks: any[];
  settings: any;
  isCompact: boolean;
}

export function DashboardBoardView({
  tasks,
  subTasks,
  settings,
  isCompact,
}: DashboardBoardViewProps) {
  // Filter tasks based on settings
  const filteredTasks = settings.showCompletedTasks
    ? tasks
    : tasks.filter((task) => task.status !== "completed");

  // Group tasks by status
  const pendingTasks = filteredTasks.filter(
    (task) => task.status === "pending",
  );
  const inProgressTasks = filteredTasks.filter(
    (task) => task.status === "in_progress",
  );
  const completedTasks = filteredTasks.filter(
    (task) => task.status === "completed",
  );

  const columns = [
    {
      id: "pending",
      title: "To Do",
      tasks: pendingTasks,
      icon: IconClock,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      id: "in_progress",
      title: "In Progress",
      tasks: inProgressTasks,
      icon: IconArrowRight,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      id: "completed",
      title: "Done",
      tasks: completedTasks,
      icon: IconCheck,
      color: "text-green-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <IconAlertTriangle className="h-3 w-3" />;
      case "medium":
        return <IconClock className="h-3 w-3" />;
      case "low":
        return <IconCheck className="h-3 w-3" />;
      default:
        return <IconList className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {tasks.length === 0 ? (
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center lg:py-16">
            <div className="mb-4 rounded-full bg-muted p-4 lg:p-6">
              <IconList className="h-8 w-8 text-muted-foreground lg:h-12 lg:w-12" />
            </div>
            <h3 className="mb-2 text-lg font-semibold lg:text-xl xl:text-2xl">
              No tasks found
            </h3>
            <p className="mb-4 max-w-md text-sm text-muted-foreground lg:max-w-lg lg:text-base">
              Start organizing your work by creating your first task. You'll be
              able to track progress, set priorities, and manage your workflow.
            </p>
            <Button
              asChild
              className="h-12 bg-primary text-base hover:bg-primary/90 lg:h-14 lg:text-lg"
            >
              <Link href="/tasks">
                <IconPlus className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                Create Your First Task
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {columns.map((column) => (
            <Card
              key={column.id}
              className={`border-border/50 bg-background/50 backdrop-blur-sm ${column.borderColor}`}
            >
              <CardHeader className={`pb-3 ${column.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <column.icon className={`h-5 w-5 ${column.color}`} />
                    <CardTitle className="text-lg">{column.title}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="bg-background/80">
                    {column.tasks.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {column.tasks.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-center">
                    <p className="text-sm text-muted-foreground">
                      No tasks in this column
                    </p>
                  </div>
                ) : (
                  column.tasks.map((task) => (
                    <Card
                      key={task.id}
                      className="cursor-pointer border border-border/30 bg-background/30 transition-all duration-200 hover:border-border/60 hover:bg-background/50"
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <h4 className="line-clamp-2 text-sm font-medium">
                              {task.title}
                            </h4>
                            <Badge
                              variant="secondary"
                              className={`text-xs ${getPriorityColor(task.priority)}`}
                            >
                              {getPriorityIcon(task.priority)}
                              <span className="ml-1 capitalize">
                                {task.priority}
                              </span>
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>
                              {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : "No due date"}
                            </span>
                            {task.subtasks && task.subtasks.length > 0 && (
                              <span>
                                {
                                  task.subtasks.filter(
                                    (st: any) => st.status === "completed",
                                  ).length
                                }
                                /{task.subtasks.length} subtasks
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Manage your tasks and workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/tasks">
                <IconPlus className="mr-2 h-4 w-4" />
                Create New Task
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/tasks">
                <IconList className="mr-2 h-4 w-4" />
                View All Tasks
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
