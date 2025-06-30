import AllTasksListTable from "@/components/tables/all-tasks-table";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  IconCheck,
  IconClock,
  IconAlertTriangle,
  IconPlus,
  IconList,
} from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function HomePage() {
  const user = await getServerAuthSession();
  if (!user?.user) {
    return <p>Unauthorized</p>;
  }

  const tasks = await api.tasks.getAllTasks();
  const subTasks = await api.tasks.getAllSubTasks();

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-2 sm:p-4 lg:p-6">
      <div className="w-full space-y-6 lg:space-y-8">
        {/* Header Section */}
        <div className="space-y-3 lg:space-y-4">
          <h1 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl lg:text-5xl xl:text-6xl">
            Welcome back, {user.user.username}! 👋
          </h1>
          <p className="max-w-4xl text-lg text-muted-foreground lg:text-xl xl:text-2xl">
            Here's an overview of your tasks and progress
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
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

          {/* Additional stats for larger screens */}
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
        </div>

        {/* Main Content - Using grid for better control */}
        <div className="grid gap-6 lg:gap-8 xl:grid-cols-3 2xl:grid-cols-4">
          {/* Quick Actions - Takes 1 column on large screens */}
          <Card className="border-border/50 bg-background/50 backdrop-blur-sm xl:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                <IconPlus className="h-5 w-5 lg:h-6 lg:w-6" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-sm lg:text-base">
                Create new tasks or manage your workflow
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                asChild
                className="h-12 w-full bg-primary text-base hover:bg-primary/90 lg:h-14 lg:text-lg"
              >
                <Link href="/tasks">
                  <IconPlus className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                  Create New Task
                </Link>
              </Button>
              <Button
                variant="outline"
                asChild
                className="h-12 w-full text-base lg:h-14 lg:text-lg"
              >
                <Link href="/tasks">
                  <IconList className="mr-2 h-4 w-4 lg:h-5 lg:w-5" />
                  View All Tasks
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Tasks Overview - Takes 2/3 width on large screens */}
          <Card className="border-border/50 bg-background/50 backdrop-blur-sm xl:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl xl:text-2xl">
                Your Tasks
              </CardTitle>
              <CardDescription className="text-sm lg:text-base">
                {totalTasks === 0
                  ? "You don&apos;t have any tasks yet. Create your first task to get started!"
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
                    Start organizing your work by creating your first task.
                    You&apos;ll be able to track progress, set priorities, and
                    manage your workflow.
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
                    <AllTasksListTable tasks={tasks} subtasks={subTasks} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Subtasks Summary - Full width on large screens */}
        {totalSubTasks > 0 && (
          <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg lg:text-xl xl:text-2xl">
                Subtasks Overview
              </CardTitle>
              <CardDescription className="text-sm lg:text-base">
                You have {totalSubTasks} subtask{totalSubTasks !== 1 ? "s" : ""}{" "}
                across all tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 lg:gap-6">
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-sm lg:mb-2 lg:text-base">
                    <span>Progress</span>
                    <span>{subtaskCompletionRate}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted lg:h-3">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-300 lg:h-3"
                      style={{ width: `${subtaskCompletionRate}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold lg:text-3xl xl:text-4xl">
                    {completedSubTasks}
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
    </div>
  );
}
