"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/trpc/react";
import { useTheme } from "@/components/theme-provider";
import { UserSettingsData } from "@/lib/settings";
import {
  Palette,
  LayoutDashboard,
  Settings as SettingsIcon,
  CreditCard,
  Moon,
  Sun,
  Monitor,
  Zap,
  Users,
  Database,
  List,
  Shield,
  Cookie,
} from "lucide-react";
import type { CustomUser } from "@/lib/types/auth";

interface SettingsClientProps {
  user: CustomUser;
}

export function SettingsClient({ user }: SettingsClientProps) {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState("appearance");

  // Get user settings from tRPC
  const { data: userSettings, refetch } = api.settings.getUserSettings.useQuery(
    undefined,
    {
      refetchOnWindowFocus: false,
    },
  );

  // Save settings mutation
  const saveSettingsMutation = api.settings.saveUserSettings.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    },
  });

  // Helper function to validate default view
  const getValidDefaultView = (
    view?: string,
  ): "list" | "board" | "calendar" => {
    if (view === "list" || view === "board" || view === "calendar") {
      return view;
    }
    return "list";
  };

  // Settings state - initialize with defaults first
  const [appearance, setAppearance] = useState({
    theme: theme,
    compactMode: false,
    showAnimations: true,
  });

  const [dashboard, setDashboard] = useState({
    defaultView: "list" as "list" | "board" | "calendar",
    showRecentTasks: true,
    showTeamActivity: true,
    showQuickActions: true,
    tasksPerPage: 10,
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    taskReminders: true,
    weeklyDigest: false,
    autoSave: true,
    showCompletedTasks: false,
  });

  const [cookiePreferences, setCookiePreferences] = useState({
    allowCookies: true,
    allowCachedData: true,
  });

  const [plan, setPlan] = useState({
    currentPlan: "free",
    usage: {
      tasks: 45,
      maxTasks: 100,
      storage: 2.5,
      maxStorage: 5,
      teamMembers: 3,
      maxTeamMembers: 5,
    },
  });

  const handleAutoSave = async (data: any) => {
    try {
      // Auto-save without showing toast - this is expected behavior
      await saveSettingsMutation.mutateAsync(data);
    } catch (error) {
      // Only show error toast if something goes wrong
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUsagePercentage = (current: number, max: number) => {
    return Math.min((current / max) * 100, 100);
  };

  // Sync appearance state with theme provider
  useEffect(() => {
    setAppearance((prev) => ({ ...prev, theme }));
  }, [theme]);

  // Update state when userSettings loads
  useEffect(() => {
    if (userSettings) {
      setAppearance({
        theme: (userSettings.theme as "light" | "dark" | "system") || theme,
        compactMode: userSettings.compactMode ?? false,
        showAnimations: userSettings.showAnimations ?? true,
      });

      setDashboard({
        defaultView: (() => {
          const view = userSettings.defaultView;
          if (view === "list" || view === "board" || view === "calendar") {
            return view as "list" | "board" | "calendar";
          }
          return "list" as const;
        })(),
        showRecentTasks: userSettings.showRecentTasks ?? true,
        showTeamActivity: userSettings.showTeamActivity ?? true,
        showQuickActions: userSettings.showQuickActions ?? true,
        tasksPerPage: userSettings.tasksPerPage ?? 10,
      });

      setPreferences({
        emailNotifications: userSettings.emailNotifications ?? true,
        pushNotifications: userSettings.pushNotifications ?? false,
        taskReminders: userSettings.taskReminders ?? true,
        weeklyDigest: userSettings.weeklyDigest ?? false,
        autoSave: userSettings.autoSave ?? true,
        showCompletedTasks: userSettings.showCompletedTasks ?? false,
      });

      setCookiePreferences({
        allowCookies: userSettings.allowCookies ?? true,
        allowCachedData: userSettings.allowCachedData ?? true,
      });
    }
  }, [userSettings, theme]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      {/* Add animation CSS (for fade/slide effect) */}
      {/* You can move this to a CSS file if preferred */}
      <style jsx global>{`
        .tab-animate {
          animation: tabFadeIn 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        @keyframes tabFadeIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="plan" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Plan</span>
          </TabsTrigger>
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent
          value="appearance"
          className={`space-y-6 ${appearance.showAnimations ? "tab-animate" : ""}`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme Settings
              </CardTitle>
              <CardDescription>
                Customize the appearance of your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <Select
                    value={appearance.theme}
                    onValueChange={(value) => {
                      const newTheme = value as "dark" | "light" | "system";
                      setAppearance({ ...appearance, theme: newTheme });
                      setTheme(newTheme);
                      handleAutoSave({ theme: newTheme });
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="h-4 w-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="h-4 w-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          System
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce spacing for a more compact layout
                    </p>
                  </div>
                  <Switch
                    checked={appearance.compactMode}
                    onCheckedChange={(checked) => {
                      setAppearance({ ...appearance, compactMode: checked });
                      handleAutoSave({ compactMode: checked });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Animations</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable smooth transitions and animations
                    </p>
                  </div>
                  <Switch
                    checked={appearance.showAnimations}
                    onCheckedChange={(checked) => {
                      setAppearance({ ...appearance, showAnimations: checked });
                      handleAutoSave({ showAnimations: checked });
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard Tab */}
        <TabsContent
          value="dashboard"
          className={`space-y-6 ${appearance.showAnimations ? "tab-animate" : ""}`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5" />
                Dashboard View
              </CardTitle>
              <CardDescription>
                Configure how your dashboard is displayed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Default View</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose the default layout for your dashboard
                    </p>
                  </div>
                  <Select
                    value={dashboard.defaultView}
                    onValueChange={(value) => {
                      setDashboard({
                        ...dashboard,
                        defaultView: value as "list" | "board" | "calendar",
                      });
                      handleAutoSave({ defaultView: value });
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="list">List View</SelectItem>
                      <SelectItem value="board">Board View</SelectItem>
                      <SelectItem value="calendar">Calendar View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Recent Tasks</Label>
                    <p className="text-sm text-muted-foreground">
                      Display recently created tasks on dashboard
                    </p>
                  </div>
                  <Switch
                    checked={dashboard.showRecentTasks}
                    onCheckedChange={(checked) => {
                      setDashboard({ ...dashboard, showRecentTasks: checked });
                      handleAutoSave({ showRecentTasks: checked });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Team Activity</Label>
                    <p className="text-sm text-muted-foreground">
                      Display recent team activity and updates
                    </p>
                  </div>
                  <Switch
                    checked={dashboard.showTeamActivity}
                    onCheckedChange={(checked) => {
                      setDashboard({ ...dashboard, showTeamActivity: checked });
                      handleAutoSave({
                        showTeamActivity: checked,
                      });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Quick Actions</Label>
                    <p className="text-sm text-muted-foreground">
                      Display quick action buttons for common tasks
                    </p>
                  </div>
                  <Switch
                    checked={dashboard.showQuickActions}
                    onCheckedChange={(checked) => {
                      setDashboard({ ...dashboard, showQuickActions: checked });
                      handleAutoSave({
                        showQuickActions: checked,
                      });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Tasks Per Page</Label>
                    <p className="text-sm text-muted-foreground">
                      Number of tasks to display per page
                    </p>
                  </div>
                  <Select
                    value={dashboard.tasksPerPage.toString()}
                    onValueChange={(value) => {
                      const tasksPerPage = parseInt(value);
                      setDashboard({
                        ...dashboard,
                        tasksPerPage,
                      });
                      handleAutoSave({ tasksPerPage });
                    }}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 tasks</SelectItem>
                      <SelectItem value="10">10 tasks</SelectItem>
                      <SelectItem value="20">20 tasks</SelectItem>
                      <SelectItem value="50">50 tasks</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent
          value="preferences"
          className={`space-y-6 ${appearance.showAnimations ? "tab-animate" : ""}`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Manage how and when you receive notifications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => {
                      setPreferences({
                        ...preferences,
                        emailNotifications: checked,
                      });
                      handleAutoSave({
                        emailNotifications: checked,
                      });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive browser push notifications
                    </p>
                  </div>
                  <Switch
                    checked={preferences.pushNotifications}
                    onCheckedChange={(checked) => {
                      setPreferences({
                        ...preferences,
                        pushNotifications: checked,
                      });
                      handleAutoSave({
                        pushNotifications: checked,
                      });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming task deadlines
                    </p>
                  </div>
                  <Switch
                    checked={preferences.taskReminders}
                    onCheckedChange={(checked) => {
                      setPreferences({
                        ...preferences,
                        taskReminders: checked,
                      });
                      handleAutoSave({ taskReminders: checked });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive a weekly summary of your activity
                    </p>
                  </div>
                  <Switch
                    checked={preferences.weeklyDigest}
                    onCheckedChange={(checked) => {
                      setPreferences({ ...preferences, weeklyDigest: checked });
                      handleAutoSave({ weeklyDigest: checked });
                    }}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">General Preferences</h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto Save</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save changes as you type
                    </p>
                  </div>
                  <Switch
                    checked={preferences.autoSave}
                    onCheckedChange={(checked) => {
                      setPreferences({ ...preferences, autoSave: checked });
                      handleAutoSave({ autoSave: checked });
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Show Completed Tasks</Label>
                    <p className="text-sm text-muted-foreground">
                      Display completed tasks in task lists
                    </p>
                  </div>
                  <Switch
                    checked={preferences.showCompletedTasks}
                    onCheckedChange={(checked) => {
                      setPreferences({
                        ...preferences,
                        showCompletedTasks: checked,
                      });
                      handleAutoSave({
                        showCompletedTasks: checked,
                      });
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Plan Tab */}
        <TabsContent
          value="plan"
          className={`space-y-6 ${appearance.showAnimations ? "tab-animate" : ""}`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription Plans
              </CardTitle>
              <CardDescription>
                Manage your subscription and billing preferences.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-lg border border-muted/50 bg-muted/20 p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-muted p-3">
                    <CreditCard className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">Coming Soon</h3>
                    <p className="max-w-md text-muted-foreground">
                      We're working on exciting subscription plans with premium
                      features. Stay tuned for updates on pricing and features.
                    </p>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    In Development
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Current Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      Free plan with basic features
                    </p>
                  </div>
                  <Badge variant="secondary">Free</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
