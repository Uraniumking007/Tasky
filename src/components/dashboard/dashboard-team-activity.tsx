"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconUser,
  IconUsers,
  IconCheck,
  IconPlus,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";

export function DashboardTeamActivity() {
  // Mock team activity data - in a real app, this would come from the API
  const teamActivities = [
    {
      id: 1,
      type: "task_created",
      user: "John Doe",
      action: "created a new task",
      target: "Design System Update",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      icon: IconPlus,
      color: "text-blue-500",
    },
    {
      id: 2,
      type: "task_completed",
      user: "Jane Smith",
      action: "completed",
      target: "User Authentication Flow",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      icon: IconCheck,
      color: "text-green-500",
    },
    {
      id: 3,
      type: "task_updated",
      user: "Mike Johnson",
      action: "updated",
      target: "API Documentation",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      icon: IconEdit,
      color: "text-yellow-500",
    },
    {
      id: 4,
      type: "member_joined",
      user: "Sarah Wilson",
      action: "joined the team",
      target: "",
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      icon: IconUsers,
      color: "text-purple-500",
    },
  ];

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - timestamp.getTime());
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return "Just now";
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  const getActivityDescription = (activity: any) => {
    if (activity.type === "member_joined") {
      return `${activity.user} joined the team`;
    }
    return `${activity.user} ${activity.action} "${activity.target}"`;
  };

  return (
    <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg">Team Activity</CardTitle>
        <CardDescription>Recent team updates and activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {teamActivities.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              No recent activity
            </p>
          ) : (
            teamActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-lg border border-border/30 p-3"
              >
                <div className={`mt-0.5 ${activity.color}`}>
                  <activity.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {getActivityDescription(activity)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {activity.type.replace("_", " ")}
                </Badge>
              </div>
            ))
          )}
        </div>

        {teamActivities.length > 0 && (
          <div className="mt-4 border-t border-border/30 pt-3">
            <button className="text-sm text-primary transition-colors hover:text-primary/80">
              View all activity →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
