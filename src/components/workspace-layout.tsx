"use client";

import { useState, useEffect } from "react";
import SideNavbar from "./side-navbar";
import Navbar from "./navbar";
import { api } from "@/trpc/react";
import type { User } from "next-auth";
import { Loader2 } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  userRole: "OWNER" | "MANAGER" | "MEMBER";
  teams: Array<{
    id: string;
    name: string;
    isPrivate?: boolean;
    allowAutoJoin?: boolean;
    members: Array<{
      user: { name?: string; email: string | null; username?: string };
    }>;
  }>;
  members: Array<{
    user: { name?: string; email: string | null; username?: string };
  }>;
}

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  organizations: Organization[];
  user: User;
}

export default function WorkspaceLayout({
  children,
  organizations,
  user,
}: WorkspaceLayoutProps) {
  const {
    data: organizationsData = [],
    isLoading,
    error,
  } = api.workspace.getWorkspaceData.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-muted-foreground">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <h2 className="mb-2 text-lg font-semibold text-destructive">
            Failed to load workspace
          </h2>
          <p className="text-muted-foreground">
            {error.message || "An error occurred while loading your workspace."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <SideNavbar
        user={user}
        teamName={user.name || ""}
        permissions={undefined}
        organizations={organizationsData as Organization[]}
      />
      <div className="w-full flex-1">{children}</div>
    </div>
  );
}
