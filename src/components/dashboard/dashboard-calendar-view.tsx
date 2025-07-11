"use client";

import { useState } from "react";
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
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import Link from "next/link";

interface DashboardCalendarViewProps {
  tasks: any[];
  subTasks: any[];
  settings: any;
  isCompact: boolean;
}

export function DashboardCalendarView({
  tasks,
  subTasks,
  settings,
  isCompact,
}: DashboardCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Filter tasks based on settings
  const filteredTasks = settings.showCompletedTasks
    ? tasks
    : tasks.filter((task) => task.status !== "completed");

  // Get tasks with due dates
  const tasksWithDueDates = filteredTasks.filter((task) => task.dueDate);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getTasksForDate = (date: Date) => {
    return tasksWithDueDates.filter((task) => {
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in_progress":
        return "bg-blue-500";
      case "pending":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const today = new Date();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Generate calendar grid
  const calendarDays = [];
  const totalCells = 42; // 6 rows * 7 days

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day,
    );
    calendarDays.push(date);
  }

  // Fill remaining cells to complete the grid
  while (calendarDays.length < totalCells) {
    calendarDays.push(null);
  }

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
        <>
          {/* Calendar Header */}
          <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{monthName}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("prev")}
                  >
                    <IconChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateMonth("next")}
                  >
                    <IconChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day) => (
                    <div
                      key={day}
                      className="p-2 text-center text-sm font-medium text-muted-foreground"
                    >
                      {day}
                    </div>
                  ),
                )}

                {/* Calendar days */}
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return (
                      <div
                        key={index}
                        className="h-24 border border-border/20 bg-muted/20"
                      />
                    );
                  }

                  const isToday = date.toDateString() === today.toDateString();
                  const isCurrentMonth =
                    date.getMonth() === currentDate.getMonth();
                  const dayTasks = getTasksForDate(date);

                  return (
                    <div
                      key={index}
                      className={`h-24 border border-border/20 p-1 transition-colors hover:bg-muted/30 ${
                        isToday ? "border-primary/30 bg-primary/10" : ""
                      } ${!isCurrentMonth ? "bg-muted/10" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-medium ${
                            isToday
                              ? "text-primary"
                              : isCurrentMonth
                                ? "text-foreground"
                                : "text-muted-foreground"
                          }`}
                        >
                          {date.getDate()}
                        </span>
                        {dayTasks.length > 0 && (
                          <Badge
                            variant="secondary"
                            className="h-4 w-4 rounded-full p-0 text-xs"
                          >
                            {dayTasks.length}
                          </Badge>
                        )}
                      </div>

                      {/* Task indicators */}
                      <div className="mt-1 space-y-1">
                        {dayTasks.slice(0, 2).map((task) => (
                          <div
                            key={task.id}
                            className={`h-1.5 w-full rounded-full ${getStatusColor(task.status)}`}
                            title={`${task.title} (${task.priority} priority)`}
                          />
                        ))}
                        {dayTasks.length > 2 && (
                          <div
                            className="h-1.5 w-full rounded-full bg-muted"
                            title={`${dayTasks.length - 2} more tasks`}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
              <CardDescription>Tasks due in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasksWithDueDates
                  .filter((task) => {
                    const taskDate = new Date(task.dueDate);
                    const weekFromNow = new Date();
                    weekFromNow.setDate(weekFromNow.getDate() + 7);
                    return taskDate >= today && taskDate <= weekFromNow;
                  })
                  .sort(
                    (a, b) =>
                      new Date(a.dueDate).getTime() -
                      new Date(b.dueDate).getTime(),
                  )
                  .slice(0, 5)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between rounded-lg border border-border/30 p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${getStatusColor(task.status)}`}
                        />
                        <div>
                          <h4 className="text-sm font-medium">{task.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            Due {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`text-xs ${getPriorityColor(task.priority)}`}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  ))}
                {tasksWithDueDates.filter((task) => {
                  const taskDate = new Date(task.dueDate);
                  const weekFromNow = new Date();
                  weekFromNow.setDate(weekFromNow.getDate() + 7);
                  return taskDate >= today && taskDate <= weekFromNow;
                }).length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No upcoming tasks
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

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
        </>
      )}
    </div>
  );
}
