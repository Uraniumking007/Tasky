"use client";
import React, { useState, useEffect } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import type { User } from "next-auth";
import { signOut } from "next-auth/react";
import { UserDropdownMenu } from "./user-dropdown";
import {
  IconHome,
  IconList,
  IconPlus,
  IconSettings,
  IconLogout,
  IconUser,
  IconChevronLeft,
  IconChevronRight,
  IconMenu2,
  IconUsers,
  IconBuilding,
  IconUserCircle,
  IconChevronDown,
  IconChevronUp,
  IconDots,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

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

export default function SideNavbar({
  user,
  teamName,
  permissions,
  organizations: initialOrganizations = [],
}: {
  user: User | null;
  teamName: string;
  permissions?: import("@/lib/permissions").UserPermissions;
  organizations?: Organization[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedOrganizations, setExpandedOrganizations] = useState<
    Set<string>
  >(new Set());
  const [organizations, setOrganizations] =
    useState<Organization[]>(initialOrganizations);

  // Update organizations when prop changes
  useEffect(() => {
    setOrganizations(initialOrganizations);
  }, [initialOrganizations]);

  const toggleOrganization = (orgId: string) => {
    router.push(`/organization/${orgId}`);
    const newExpanded = new Set(expandedOrganizations);
    if (newExpanded.has(orgId)) {
      newExpanded.delete(orgId);
    } else {
      newExpanded.add(orgId);
    }
    setExpandedOrganizations(newExpanded);
  };

  const navigationItems = [
    {
      title: "Dashboard",
      href: "/home",
      icon: IconHome,
    },
    {
      title: "All Tasks",
      href: "/tasks",
      icon: IconList,
    },
    {
      title: "Create Task",
      href: "/tasks?create=true",
      icon: IconPlus,
    },
  ];

  return (
    <div
      className={cn(
        "flex h-screen flex-col border-r border-border/40 bg-background/95 backdrop-blur-sm transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-72",
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-border/40 px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm">
            <IconList className="h-4 w-4" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-lg font-bold">
                Tasky
              </span>
              <span className="text-xs text-muted-foreground">
                Task Management
              </span>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0 hover:bg-muted/60"
        >
          {isCollapsed ? (
            <IconChevronRight className="h-4 w-4" />
          ) : (
            <IconChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* User Section */}
      {!isCollapsed && (
        <div className="border-b border-border/40 p-4">
          <UserDropdownMenu
            user={user}
            teamName={teamName}
            isCollapsed={isCollapsed}
            permissions={permissions}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Navigation */}
        <div className="p-4">
          <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Navigation
              </h3>
            )}
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "h-10 w-full justify-start gap-3 transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted/60",
                      isCollapsed && "justify-center px-2",
                    )}
                    title={isCollapsed ? item.title : undefined}
                  >
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium">{item.title}</span>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Workspace Section */}
        {!isCollapsed && (
          <div className="p-4 pt-0">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Workspace
                </h3>
                <Link href="/manage-workspace">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <IconDots className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              {organizations.length > 0 ? (
                <div className="space-y-2">
                  {organizations.map((org) => (
                    <div key={org.id} className="space-y-1">
                      {/* Organization */}
                      <div className="group relative">
                        <Button
                          variant="ghost"
                          onClick={() => toggleOrganization(org.id)}
                          className="h-9 w-full justify-between px-2 hover:bg-muted/60"
                        >
                          <div className="flex min-w-0 flex-1 items-center gap-2">
                            <IconBuilding className="h-4 w-4 flex-shrink-0 text-blue-500" />
                            <span className="truncate text-sm font-medium">
                              {org.name}
                            </span>
                            <Badge
                              variant={
                                org.userRole === "OWNER"
                                  ? "default"
                                  : "secondary"
                              }
                              className="h-5 px-1.5 py-0 text-xs"
                            >
                              {org.userRole}
                            </Badge>
                          </div>
                          {org.teams.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">
                                {org.teams.length}
                              </span>
                              {expandedOrganizations.has(org.id) ? (
                                <IconChevronUp className="h-3 w-3" />
                              ) : (
                                <IconChevronDown className="h-3 w-3" />
                              )}
                            </div>
                          )}
                        </Button>

                        {/* Organization Actions */}
                        <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0"
                              >
                                <IconDots className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem asChild>
                                <Link href={`/organization/${org.id}`}>
                                  View Organization
                                </Link>
                              </DropdownMenuItem>
                              {(org.userRole === "OWNER" ||
                                org.userRole === "MANAGER") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Add Team</DropdownMenuItem>
                                  <DropdownMenuItem>
                                    Invite Members
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Teams */}
                      {expandedOrganizations.has(org.id) &&
                        org.teams.length > 0 && (
                          <div className="ml-4 space-y-1 border-l border-border/30 pl-3">
                            {org.teams.map((team) => (
                              <div key={team.id} className="group relative">
                                <Link href={`/team/${team.id}`}>
                                  <Button
                                    variant="ghost"
                                    className="h-8 w-full justify-start gap-2 px-2 hover:bg-muted/60"
                                  >
                                    <IconUsers className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                                    <span className="truncate text-sm">
                                      {team.name}
                                    </span>
                                    <span className="ml-auto text-xs text-muted-foreground">
                                      {team.members.length}
                                    </span>
                                  </Button>
                                </Link>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-2 py-6 text-center">
                  <IconBuilding className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                  <p className="mb-3 text-sm text-muted-foreground">
                    No organizations yet
                  </p>
                  <Link href="/manage-workspace">
                    <Button size="sm" className="h-8">
                      <IconPlus className="mr-1 h-3 w-3" />
                      Create Organization
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border/40 p-4">
        <div className="space-y-2">
          <Link href="/settings">
            <Button
              variant="ghost"
              className={cn(
                "h-9 w-full justify-start gap-3 transition-all duration-200 hover:bg-muted/60",
                isCollapsed && "justify-center px-2",
              )}
              title={isCollapsed ? "Settings" : undefined}
            >
              <IconSettings className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">Settings</span>}
            </Button>
          </Link>

          {user ? (
            <Button
              variant="ghost"
              onClick={async () => {
                await signOut({ callbackUrl: "/" });
              }}
              className={cn(
                "h-9 w-full justify-start gap-3 transition-all duration-200 hover:bg-red-50 hover:text-red-600",
                isCollapsed && "justify-center px-2",
              )}
              title={isCollapsed ? "Logout" : undefined}
            >
              <IconLogout className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">Logout</span>}
            </Button>
          ) : (
            <Link href="/auth/login">
              <Button
                className={cn(
                  "h-9 w-full gap-3 transition-all duration-200",
                  isCollapsed && "justify-center px-2",
                )}
                title={isCollapsed ? "Get Started" : undefined}
              >
                <IconUser className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span className="text-sm">Get Started</span>}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
