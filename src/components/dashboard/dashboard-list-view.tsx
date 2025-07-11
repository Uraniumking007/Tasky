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
} from "@tabler/icons-react";
import Link from "next/link";
import AllTasksListTable from "@/components/tables/all-tasks-table";

interface DashboardListViewProps {
  tasks: any[];
  subTasks: any[];
  settings: any;
  isCompact: boolean;
}

export function DashboardListView({
  tasks,
  subTasks,
  settings,
  isCompact,
}: DashboardListViewProps) {
  // Filter tasks based on settings
  const filteredTasks = settings.showCompletedTasks
    ? tasks
    : tasks.filter((task) => task.status !== "completed");

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(
    (task) => task.status === "completed",
  ).length;
  const pendingTasks = tasks.filter((task) => task.status === "pending").length;
  const highPriorityTasks = tasks.filter(
    (task) => task.priority === "high",
  ).length;

  return (
    <div className="space-y-6">
      {/* Tasks Overview */}
      <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl xl:text-2xl">
            Your Tasks
          </CardTitle>
          <CardDescription className="text-sm lg:text-base">
            {totalTasks === 0
              ? "You don't have any tasks yet. Create your first task to get started!"
              : `You have ${totalTasks} task${totalTasks !== 1 ? "s" : ""} in total`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center lg:py-16">
              <div className="mb-4 rounded-full bg-muted p-4 lg:p-6">
                <IconList className="h-8 w-8 text-muted-foreground lg:h-12 lg:w-12" />
              </div>
              <h3 className="mb-2 text-lg font-semibold lg:text-xl xl:text-2xl">
                No tasks found
              </h3>
              <p className="mb-4 max-w-md text-sm text-muted-foreground lg:max-w-lg lg:text-base">
                Start organizing your work by creating your first task. You'll
                be able to track progress, set priorities, and manage your
                workflow.
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
            </div>
          ) : (
            <div className="space-y-4 lg:space-y-6">
              {/* Task Status Summary */}
              <div className="flex flex-wrap gap-2 lg:gap-3">
                <Badge
                  variant="secondary"
                  className="bg-green-100 px-3 py-1 text-xs text-green-800 hover:bg-green-100 lg:text-sm"
                >
                  <IconCheck className="mr-1 h-3 w-3 lg:h-4 lg:w-4" />
                  {completedTasks} Completed
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-orange-100 px-3 py-1 text-xs text-orange-800 hover:bg-orange-100 lg:text-sm"
                >
                  <IconClock className="mr-1 h-3 w-3 lg:h-4 lg:w-4" />
                  {pendingTasks} Pending
                </Badge>
                {highPriorityTasks > 0 && (
                  <Badge
                    variant="secondary"
                    className="bg-red-100 px-3 py-1 text-xs text-red-800 hover:bg-red-100 lg:text-sm"
                  >
                    <IconAlertTriangle className="mr-1 h-3 w-3 lg:h-4 lg:w-4" />
                    {highPriorityTasks} High Priority
                  </Badge>
                )}
              </div>

              {/* Tasks Table */}
              <div className="overflow-hidden rounded-lg border border-border/50">
                <AllTasksListTable tasks={filteredTasks} subtasks={subTasks} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subtasks Summary - Full width on large screens */}
      {subTasks.length > 0 && (
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg lg:text-xl xl:text-2xl">
              Subtasks Overview
            </CardTitle>
            <CardDescription className="text-sm lg:text-base">
              You have {subTasks.length} subtask
              {subTasks.length !== 1 ? "s" : ""} across all tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="flex-1">
                <div className="mb-1 flex justify-between text-sm lg:mb-2 lg:text-base">
                  <span>Progress</span>
                  <span>
                    {subTasks.length > 0
                      ? Math.round(
                          (subTasks.filter((st) => st.status === "completed")
                            .length /
                            subTasks.length) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted lg:h-3">
                  <div
                    className="h-2 rounded-full bg-primary transition-all duration-300 lg:h-3"
                    style={{
                      width: `${
                        subTasks.length > 0
                          ? Math.round(
                              (subTasks.filter(
                                (st) => st.status === "completed",
                              ).length /
                                subTasks.length) *
                                100,
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold lg:text-3xl xl:text-4xl">
                  {subTasks.filter((st) => st.status === "completed").length}
                </div>
                <div className="text-xs text-muted-foreground lg:text-sm">
                  completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
