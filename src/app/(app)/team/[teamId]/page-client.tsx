"use client";

import { api } from "@/trpc/react";
import {
  Loader2,
  Users,
  Building2,
  Shield,
  User,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  EditTeamButton,
  DeleteTeamButton,
  AddMemberButton,
  RemoveMemberButton,
  ManageSettingsButton,
} from "./client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface TeamPageClientProps {
  teamId: string;
}

export function TeamPageClient({ teamId }: TeamPageClientProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const {
    data: teamData,
    isLoading,
    error,
  } = api.team.getTeam.useQuery(
    { teamId },
    {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  );

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin" />
            <p className="text-muted-foreground">Loading team...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-destructive">
            Access Denied
          </h1>
          <p className="mb-4 text-muted-foreground">
            {error.message ||
              "You don&apos;t have permission to view this team."}
          </p>
          <Button asChild>
            <Link href="/home">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!teamData) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Team Not Found</h1>
          <p className="mb-4 text-muted-foreground">
            The team you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/home">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { team, canManage, managementReason, userRole } = teamData;

  // Type assertion to work around Prisma type caching issue
  const teamWithTypes = team as typeof team & {
    members: Array<{
      id: string;
      userId: string;
      role: string;
      user: { id: string; name?: string; email: string; username?: string };
    }>;
    organization?: { id: string; name: string } | null;
    isPrivate?: boolean;
    allowAutoJoin?: boolean;
  };

  // Debug info - remove this after fixing the issue
  if (process.env.NODE_ENV === "development") {
    console.log("Team Debug Info:", {
      teamId: team.id,
      teamName: team.name,
      canManage,
      managementReason,
      userRole,
      userEmail: session?.user?.email,
      teamOwnerId: team.ownerId,
      teamMembers: teamWithTypes.members.map((m) => ({
        userId: m.userId,
        email: m.user.email,
        role: m.role,
      })),
    });
  }

  // For permissions, we'll use simple role-based logic here
  // In a full implementation, you'd want to import the actual permission functions
  const isOwnerOrManager = userRole === "OWNER" || userRole === "MANAGER";
  const canEditTeam = canManage && isOwnerOrManager;
  const canDeleteTeam = canManage && userRole === "OWNER";
  const canInviteMembers = canManage && isOwnerOrManager;
  const canRemoveMembers = canManage && isOwnerOrManager;

  // For manage settings, we'll also allow if user is team owner regardless of canManage
  const currentUserMember = teamWithTypes.members.find(
    (m) => m.user.email === session?.user?.email,
  );
  const isTeamOwner = currentUserMember?.role === "OWNER";
  const canManageSettings = canManage || isTeamOwner;

  // Debug info for manage settings
  if (process.env.NODE_ENV === "development") {
    console.log("Manage Settings Debug:", {
      canManage,
      isTeamOwner,
      canManageSettings,
      currentUserMember,
      teamOwnerId: team.ownerId,

      sessionUserEmail: session?.user?.email,
    });
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Team Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-3xl">
                <Building2 className="h-8 w-8 text-primary" />
                {team.name}
              </CardTitle>
              <CardDescription className="mt-2">
                Team ID: {team.id}
                {teamWithTypes.organization && (
                  <span className="ml-4">
                    Organization: {teamWithTypes.organization.name}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  userRole === "OWNER"
                    ? "default"
                    : userRole === "MANAGER"
                      ? "secondary"
                      : "outline"
                }
              >
                {userRole ? userRole : `Org ${managementReason}`}
              </Badge>
              {canEditTeam && (
                <EditTeamButton teamId={team.id} teamName={team.name} />
              )}
              {canDeleteTeam && (
                <DeleteTeamButton teamId={team.id} teamName={team.name} />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{teamWithTypes.members.length}</p>
                <p className="text-sm text-muted-foreground">Members</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Active</p>
                <p className="text-sm text-muted-foreground">Status</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {new Date(team.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">Created</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Team Members */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Members
              </CardTitle>
              {canInviteMembers && (
                <AddMemberButton teamId={team.id} teamName={team.name} />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {teamWithTypes.members.map((member) => {
                const isCurrentUser =
                  member.user.email === session?.user?.email;
                const canRemoveThisMember =
                  canRemoveMembers && !isCurrentUser && member.role !== "OWNER";

                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {member.user.name ||
                            member.user.username ||
                            "Unknown User"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          member.role === "OWNER"
                            ? "default"
                            : member.role === "MANAGER"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {member.role}
                      </Badge>
                      {canRemoveThisMember && (
                        <RemoveMemberButton
                          teamId={team.id}
                          memberUserId={member.userId}
                          memberName={
                            member.user.name ||
                            member.user.username ||
                            "Unknown User"
                          }
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Team Actions & Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Team Management
            </CardTitle>
            <CardDescription>Manage team settings and actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="mb-2 font-medium">Quick Actions</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <Link href="/tasks">View Tasks</Link>
                  </Button>
                  <ManageSettingsButton
                    teamId={team.id}
                    teamName={team.name}
                    canManage={canManageSettings}
                  />
                </div>
              </div>

              {managementReason === "org_role" && (
                <div className="rounded-lg border bg-blue-50 p-4 dark:bg-blue-950/20">
                  <h4 className="mb-2 font-medium text-blue-900 dark:text-blue-100">
                    Organization Access
                  </h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    You can manage this team through your organization role.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization Link */}
      {teamWithTypes.organization && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Part of Organization</h3>
                <p className="text-sm text-muted-foreground">
                  {teamWithTypes.organization.name}
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/organization/${teamWithTypes.organization.id}`}>
                  View Organization
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
