"use client";

import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  LayoutGrid,
  List,
  Calendar as CalendarIcon,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { DashboardStats } from "./dashboard-stats";
import { DashboardListView } from "./dashboard-list-view";
import { DashboardBoardView } from "./dashboard-board-view";
import { DashboardCalendarView } from "./dashboard-calendar-view";
import { DashboardQuickActions } from "./dashboard-quick-actions";
import { DashboardTeamActivity } from "./dashboard-team-activity";
import { DashboardRecentTasks } from "./dashboard-recent-tasks";

interface DashboardContainerProps {
  user: {
    name?: string | null;
    email?: string | null;
    username?: string | null;
  };
}

export function DashboardContainer({ user }: DashboardContainerProps) {
  const [activeView, setActiveView] = useState<"list" | "board" | "calendar">(
    "list",
  );
  const [isCompact, setIsCompact] = useState(false);

  // Get user settings
  const {
    data: userSettings,
    isLoading: settingsLoading,
    error: settingsError,
  } = api.settings.getUserSettings.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  // Get tasks data
  const { data: tasks = [], isLoading: tasksLoading } =
    api.tasks.getAllTasks.useQuery();
  const { data: subTasks = [] } = api.tasks.getAllSubTasks.useQuery();

  // Debug logging
  useEffect(() => {
    console.log("Dashboard Container - User Settings:", userSettings);
    console.log("Dashboard Container - Settings Loading:", settingsLoading);
    console.log("Dashboard Container - Settings Error:", settingsError);
  }, [userSettings, settingsLoading, settingsError]);

  // Set initial view based on user settings
  useEffect(() => {
    if (userSettings?.defaultView) {
      console.log("Setting default view to:", userSettings.defaultView);
      setActiveView(userSettings.defaultView as "list" | "board" | "calendar");
    }
  }, [userSettings?.defaultView]);

  // Set compact mode based on user settings
  useEffect(() => {
    if (userSettings?.compactMode !== undefined) {
      console.log("Setting compact mode to:", userSettings.compactMode);
      setIsCompact(userSettings.compactMode);
    }
  }, [userSettings?.compactMode]);

  if (settingsLoading || tasksLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (settingsError) {
    console.error("Settings error:", settingsError);
  }

  const settings = userSettings || {
    defaultView: "list" as const,
    showRecentTasks: true,
    showTeamActivity: true,
    showQuickActions: true,
    tasksPerPage: 10,
    showCompletedTasks: false,
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-2 sm:p-4 lg:p-6 ${isCompact ? "space-y-4" : "space-y-6 lg:space-y-8"}`}
    >
      <div className="w-full space-y-6 lg:space-y-8">
        {/* Header Section */}
        <div className="space-y-3 lg:space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl lg:text-5xl xl:text-6xl">
                Welcome back, {user.username || user.name}! 👋
              </h1>
              <p className="max-w-4xl text-lg text-muted-foreground lg:text-xl xl:text-2xl">
                Here&apos;s an overview of your tasks and progress
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <DashboardStats tasks={tasks} subTasks={subTasks} />

        {/* View Toggle */}
        <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Dashboard View</CardTitle>
            <CardDescription>
              Choose how you want to view your tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeView}
              onValueChange={(value) =>
                setActiveView(value as "list" | "board" | "calendar")
              }
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span className="hidden sm:inline">List View</span>
                </TabsTrigger>
                <TabsTrigger value="board" className="flex items-center gap-2">
                  <LayoutGrid className="h-4 w-4" />
                  <span className="hidden sm:inline">Board View</span>
                </TabsTrigger>
                <TabsTrigger
                  value="calendar"
                  className="flex items-center gap-2"
                >
                  <CalendarIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Calendar View</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="mt-6">
                <DashboardListView
                  tasks={tasks}
                  subTasks={subTasks}
                  settings={settings}
                  isCompact={isCompact}
                />
              </TabsContent>

              <TabsContent value="board" className="mt-6">
                <DashboardBoardView
                  tasks={tasks}
                  subTasks={subTasks}
                  settings={settings}
                  isCompact={isCompact}
                />
              </TabsContent>

              <TabsContent value="calendar" className="mt-6">
                <DashboardCalendarView
                  tasks={tasks}
                  subTasks={subTasks}
                  settings={settings}
                  isCompact={isCompact}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Additional Dashboard Sections */}
        <div className="grid gap-6 lg:gap-8 xl:grid-cols-3 2xl:grid-cols-4">
          {/* Quick Actions */}
          {settings.showQuickActions && (
            <div className="xl:col-span-1">
              <DashboardQuickActions />
            </div>
          )}

          {/* Recent Tasks */}
          {settings.showRecentTasks && (
            <div className="xl:col-span-1">
              <DashboardRecentTasks tasks={tasks} settings={settings} />
            </div>
          )}

          {/* Team Activity */}
          {settings.showTeamActivity && (
            <div className="xl:col-span-1">
              <DashboardTeamActivity />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
