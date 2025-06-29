"use client";

import { useState, useEffect } from "react";
import SideNavbar from "@/components/side-navbar";
import { api } from "@/trpc/react";
import type { User } from "next-auth";
import { Loader2 } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  userRole: "OWNER" | "MANAGER" | "MEMBER";
  teams: Team[];
  members: any[];
}

interface Team {
  id: string;
  name: string;
  organizationId?: string | null;
  members: any[];
}

interface WorkspaceLayoutProps {
  user: User;
  teamName: string;
  permissions?: import("@/lib/permissions").UserPermissions;
  children: React.ReactNode;
}

export default function WorkspaceLayout({
  user,
  teamName,
  permissions,
  children,
}: WorkspaceLayoutProps) {
  const {
    data: organizations = [],
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
        teamName={teamName}
        permissions={permissions}
        organizations={organizations as Organization[]}
      />
      <div className="w-full flex-1">{children}</div>
    </div>
  );
}
