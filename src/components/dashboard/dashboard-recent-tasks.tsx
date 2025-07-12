"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { IconClock } from "@tabler/icons-react";

interface Task {
  id: string;
  title: string;
  content?: string | null;
  status: string;
  priority: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  teamId?: string | null;
  assignedTo?: string | null;
  dueDate?: Date | null;
}

interface SubTask {
  id: string;
  title: string;
  content?: string | null;
  status: string;
  taskId: string;
  user_id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface DashboardRecentTasksProps {
  tasks: Task[];
  subTasks: SubTask[];
  settings: {
    showCompletedTasks?: boolean;
  };
}

export function DashboardRecentTasks({
  tasks,
  settings,
}: DashboardRecentTasksProps) {
  // Filter tasks based on settings
  const filteredTasks = settings.showCompletedTasks
    ? tasks
    : tasks.filter((task) => task.status !== "completed");

  // Get recent tasks (last 5 created)
  const recentTasks = filteredTasks
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 5);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <IconClock className="h-3 w-3 text-green-500" />;
      case "in_progress":
        return <IconClock className="h-3 w-3 text-blue-500" />;
      case "pending":
        return <IconClock className="h-3 w-3 text-orange-500" />;
      default:
        return <IconClock className="h-3 w-3 text-gray-500" />;
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - d.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return "Today";
    } else if (diffDays === 2) {
      return "Yesterday";
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return d.toLocaleDateString();
    }
  };

  return (
    <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Recent Tasks</CardTitle>
        <CardDescription>Recently created tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentTasks.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No recent tasks
            </p>
          ) : (
            recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border border-border/30 p-3"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(task.status)}
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-medium">
                      {task.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(task.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getPriorityColor(task.priority)}`}
                  >
                    {task.priority}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {recentTasks.length > 0 && (
          <div className="mt-4 border-t border-border/30 pt-3">
            <Link
              href="/tasks"
              className="text-sm text-primary transition-colors hover:text-primary/80"
            >
              View all tasks →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 