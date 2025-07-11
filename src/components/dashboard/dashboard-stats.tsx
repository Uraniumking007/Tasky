"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconList,
} from "@tabler/icons-react";

interface DashboardStatsProps {
  tasks: any[];
  subTasks: any[];
  settings?: {
    showTotalTasksCard?: boolean;
    showCompletedCard?: boolean;
    showPendingCard?: boolean;
    showHighPriorityCard?: boolean;
    showSubtasksCard?: boolean;
    showProductivityCard?: boolean;
  };
}

export function DashboardStats({
  tasks,
  subTasks,
  settings,
}: DashboardStatsProps) {
  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;
  const highPriorityTasks = tasks.filter(
    (task) => task.priority === "high",
  ).length;
  const totalSubTasks = subTasks.length;
  const completedSubTasks = subTasks.filter(
    (subtask) => subtask.status === "completed",
  ).length;

  // Calculate completion percentage
  const taskCompletionRate =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const subtaskCompletionRate =
    totalSubTasks > 0
      ? Math.round((completedSubTasks / totalSubTasks) * 100)
      : 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {settings?.showTotalTasksCard !== false && (
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-200 hover:bg-background/80 lg:p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 lg:pb-3">
            <CardTitle className="text-sm font-medium lg:text-base">
              Total Tasks
            </CardTitle>
            <IconList className="h-4 w-4 text-muted-foreground lg:h-5 lg:w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold lg:text-3xl xl:text-4xl">
              {totalTasks}
            </div>
            <p className="text-xs text-muted-foreground lg:text-sm">
              {taskCompletionRate}% completed
            </p>
          </CardContent>
        </Card>
      )}

      {settings?.showCompletedCard !== false && (
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-200 hover:bg-background/80 lg:p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 lg:pb-3">
            <CardTitle className="text-sm font-medium lg:text-base">
              Completed
            </CardTitle>
            <IconCheck className="h-4 w-4 text-green-500 lg:h-5 lg:w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 lg:text-3xl xl:text-4xl">
              {completedTasks}
            </div>
            <p className="text-xs text-muted-foreground lg:text-sm">
              {totalTasks > 0
                ? `${Math.round((completedTasks / totalTasks) * 100)}%`
                : "0%"}{" "}
              of total
            </p>
          </CardContent>
        </Card>
      )}

      {settings?.showPendingCard !== false && (
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-200 hover:bg-background/80 lg:p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 lg:pb-3">
            <CardTitle className="text-sm font-medium lg:text-base">
              Pending
            </CardTitle>
            <IconClock className="h-4 w-4 text-orange-500 lg:h-5 lg:w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 lg:text-3xl xl:text-4xl">
              {pendingTasks}
            </div>
            <p className="text-xs text-muted-foreground lg:text-sm">
              {totalTasks > 0
                ? `${Math.round((pendingTasks / totalTasks) * 100)}%`
                : "0%"}{" "}
              of total
            </p>
          </CardContent>
        </Card>
      )}

      {settings?.showHighPriorityCard !== false && (
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-200 hover:bg-background/80 lg:p-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 lg:pb-3">
            <CardTitle className="text-sm font-medium lg:text-base">
              High Priority
            </CardTitle>
            <IconAlertTriangle className="h-4 w-4 text-red-500 lg:h-5 lg:w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 lg:text-3xl xl:text-4xl">
              {highPriorityTasks}
            </div>
            <p className="text-xs text-muted-foreground lg:text-sm">
              Needs attention
            </p>
          </CardContent>
        </Card>
      )}

      {/* Additional stats for larger screens */}
      {settings?.showSubtasksCard !== false && (
        <Card className="hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-200 hover:bg-background/80 lg:p-2 xl:block">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 lg:pb-3">
            <CardTitle className="text-sm font-medium lg:text-base">
              Subtasks
            </CardTitle>
            <IconList className="h-4 w-4 text-blue-500 lg:h-5 lg:w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 lg:text-3xl xl:text-4xl">
              {totalSubTasks}
            </div>
            <p className="text-xs text-muted-foreground lg:text-sm">
              {subtaskCompletionRate}% completed
            </p>
          </CardContent>
        </Card>
      )}

      {settings?.showProductivityCard !== false && (
        <Card className="hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-200 hover:bg-background/80 lg:p-2 2xl:block">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 lg:pb-3">
            <CardTitle className="text-sm font-medium lg:text-base">
              Productivity
            </CardTitle>
            <IconCheck className="h-4 w-4 text-purple-500 lg:h-5 lg:w-5" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 lg:text-3xl xl:text-4xl">
              {taskCompletionRate}%
            </div>
            <p className="text-xs text-muted-foreground lg:text-sm">
              Overall completion
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
