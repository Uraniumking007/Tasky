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
  InviteMemberModal,
  CreateTeamModal,
  AddTeamMemberModal,
  RemoveMemberButton,
  ViewInvitesButton,
  EditOrganizationModal,
  EditTeamButton,
} from "./client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

interface OrganizationPageClientProps {
  organizationId: string;
}

export function OrganizationPageClient({
  organizationId,
}: OrganizationPageClientProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    redirect("/auth/login");
  }

  const {
    data: orgData,
    isLoading,
    error,
  } = api.organization.getOrganization.useQuery(
    { organizationId },
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
            <p className="text-muted-foreground">Loading organization...</p>
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
              "You don't have permission to view this organization."}
          </p>
          <Button asChild>
            <Link href="/home">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!orgData) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Organization Not Found</h1>
          <p className="mb-4 text-muted-foreground">
            The organization you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link href="/home">Go to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  const { organization, userRole, permissions } = orgData;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Organization Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-3xl">
                <Building2 className="h-8 w-8 text-primary" />
                {organization.name}
              </CardTitle>
              <CardDescription className="mt-2">
                Organization ID: {organization.id}
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
                {userRole}
              </Badge>
              <EditOrganizationModal
                organizationId={organizationId}
                organizationName={organization.name}
                canEdit={permissions.canEditOrganization}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{organization.members.length}</p>
                <p className="text-sm text-muted-foreground">Members</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">{organization.teams.length}</p>
                <p className="text-sm text-muted-foreground">Teams</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {new Date(organization.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">Created</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Organization Members */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Organization Members
              </CardTitle>
              <div className="flex items-center gap-2">
                {permissions.canInviteOrganizationMembers && (
                  <ViewInvitesButton
                    organizationId={organizationId}
                    canManageInvites={permissions.canInviteOrganizationMembers}
                  />
                )}
                <InviteMemberModal
                  organizationId={organizationId}
                  canInvite={permissions.canInviteOrganizationMembers}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {organization.members.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <p>No members available</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {organization.members.map((member) => (
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
                        <RemoveMemberButton
                          organizationId={organizationId}
                          memberUserId={member.userId}
                          memberName={
                            member.user.name ||
                            member.user.username ||
                            member.user.email ||
                            "Unknown User"
                          }
                          canRemove={
                            permissions.canRemoveOrganizationMembers &&
                            member.userId !== organization.ownerId &&
                            member.role !== "OWNER"
                          }
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Teams */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {permissions.canViewAllTeamsInOrg ? "All Teams" : "My Teams"}
              </CardTitle>
              <CreateTeamModal
                organizationId={organizationId}
                canCreate={permissions.canCreateTeams}
              />
            </div>
          </CardHeader>
          <CardContent>
            {organization.teams.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Building2 className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No teams available</p>
              </div>
            ) : (
              <div className="space-y-3">
                {organization.teams.map((team) => {
                  // Get current user ID from session (we'll need to fetch it)
                  const userTeamRole = team.members.find(
                    (m) => m.user.email === session?.user?.email,
                  )?.role;

                  // Organization owners/managers can manage teams even if not team members
                  const canManageTeam =
                    userTeamRole === "OWNER" ||
                    userTeamRole === "MANAGER" ||
                    userRole === "OWNER" ||
                    userRole === "MANAGER";

                  return (
                    <div
                      key={team.id}
                      className="rounded-lg border p-4 transition-colors hover:bg-muted/50"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium">{team.name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {team.members.length} members
                          </Badge>
                          {userTeamRole ? (
                            <Badge variant="secondary" className="text-xs">
                              {userTeamRole}
                            </Badge>
                          ) : canManageTeam ? (
                            <Badge variant="outline" className="text-xs">
                              Org {userRole}
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Team ID: {team.id}</span>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/team/${team.id}`}>View Team</Link>
                        </Button>
                        <AddTeamMemberModal
                          teamId={team.id}
                          organizationId={organizationId}
                          canAdd={
                            canManageTeam && permissions.canManageTeamMembers
                          }
                        />
                        <EditTeamButton
                          teamId={team.id}
                          teamName={team.name}
                          organizationId={organizationId}
                          canEdit={permissions.canEditTeams && canManageTeam}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes Section - Placeholder for future implementation */}
      {permissions.canViewOwnNotes && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Notes
            </CardTitle>
            <CardDescription>
              {permissions.canViewTeamNotes
                ? "View and manage team notes"
                : "View your personal notes"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="py-8 text-center text-muted-foreground">
              <Shield className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>Notes feature coming soon</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
