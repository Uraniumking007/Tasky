"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CreateTeamModal from "./CreateTeamModal";
import EditOrganizationModal from "./EditOrganizationModal";
import EditTeamModal from "./EditTeamModal";
import {
  AddOrganizationMemberModal,
  RemoveOrganizationMemberModal,
} from "@/components/modals/shared-organization-modals";
import { Users, Edit, Trash2, UserPlus, UserMinus } from "lucide-react";
import TeamDetailModal from "@/components/modals/team-detail-modal";

export default function OrganizationCard({
  org,
  user,
  handlers,
}: {
  org: any;
  user: any;
  handlers: any;
}) {
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isRemoveMemberModalOpen, setIsRemoveMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [isTeamDetailModalOpen, setIsTeamDetailModalOpen] = useState(false);

  // Check if current user is the organization owner
  const isOwner = org.ownerId === user.id;
  const userRole = org.userRole || (isOwner ? "OWNER" : "MEMBER");

  const handleInviteSent = () => {
    // Refresh the page or update the data
    window.location.reload();
  };

  const handleRemoveMember = (member: any) => {
    setSelectedMember(member);
    setIsRemoveMemberModalOpen(true);
  };

  const handleMemberRemoved = () => {
    // Refresh the page or update the data
    window.location.reload();
  };

  const handleTeamClick = (team: any) => {
    setSelectedTeam(team);
    setIsTeamDetailModalOpen(true);
  };

  const handleEditTeam = (e: React.MouseEvent, team: any) => {
    e.stopPropagation();
    handlers.onEditTeam(team, org.id);
  };

  const handleDeleteTeam = (e: React.MouseEvent, teamId: string) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this team?")) {
      handlers.onDeleteTeam(teamId);
    }
  };

  return (
    <>
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        {/* Organization Header */}
        <Card className="mb-8 rounded-2xl bg-white/80 p-6 shadow-xl dark:bg-background/80">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-3xl font-bold">
                <span className="text-primary">🏢</span>
                {org.name}
                <span className="ml-2 text-sm text-muted-foreground">
                  ID: {org.id}
                </span>
              </CardTitle>
              <div className="flex gap-2">
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
                {userRole === "OWNER" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlers.onEditOrg(org)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Organization
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlers.onDeleteOrg(org.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Organization
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h3 className="mb-4 text-lg font-semibold">
                Organization Members
              </h3>
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {org.members.map((member: any) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {member.user.username || member.user.email}
                      </span>
                      <Badge
                        variant={
                          member.role === "OWNER" ? "default" : "secondary"
                        }
                        className="text-xs"
                      >
                        {member.role}
                      </Badge>
                    </div>
                    {/* Show remove button only for organization owners and not for themselves */}
                    {userRole === "OWNER" && member.userId !== user.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(member)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                        title="Remove member"
                      >
                        <UserMinus className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {(userRole === "OWNER" || userRole === "MANAGER") && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setIsAddMemberModalOpen(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Member
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Teams Section */}
        <div className="mb-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Teams</h2>
            {(userRole === "OWNER" || userRole === "MANAGER") && (
              <CreateTeamModal orgId={org.id} handlers={handlers} />
            )}
          </div>

          {org.teams.length === 0 ? (
            <Card className="rounded-2xl bg-white/80 p-8 text-center shadow-xl dark:bg-background/80">
              <div className="text-muted-foreground">
                <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <h3 className="mb-2 text-lg font-semibold">No teams yet</h3>
                <p className="mb-4">
                  Create your first team to start collaborating
                </p>
                {(userRole === "OWNER" || userRole === "MANAGER") && (
                  <CreateTeamModal orgId={org.id} handlers={handlers} />
                )}
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {org.teams.map((team: any) => (
                <Card
                  key={team.id}
                  className="group cursor-pointer rounded-2xl bg-white/80 p-6 shadow-xl transition-all hover:scale-105 hover:shadow-2xl dark:bg-background/80"
                  onClick={() => handleTeamClick(team)}
                >
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-primary">
                        {team.name}
                      </h3>
                      <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {(userRole === "OWNER" || userRole === "MANAGER") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleEditTeam(e, team)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                        {userRole === "OWNER" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDeleteTeam(e, team.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {team.members.length} member
                        {team.members.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Members</h4>
                    {team.members.length === 0 ? (
                      <p className="text-xs text-muted-foreground">
                        No members yet
                      </p>
                    ) : (
                      <div className="space-y-1">
                        {team.members.slice(0, 3).map((member: any) => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between rounded bg-muted/50 px-2 py-1"
                          >
                            <span className="truncate text-xs">
                              {member.user.username || member.user.email}
                            </span>
                            <Badge
                              variant={
                                member.role === "OWNER"
                                  ? "default"
                                  : member.role === "MANAGER"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="text-xs"
                            >
                              {member.role}
                            </Badge>
                          </div>
                        ))}
                        {team.members.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{team.members.length - 3} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AddOrganizationMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        organizationId={org.id}
        organizationName={org.name}
        onInviteSent={handleInviteSent}
      />

      {selectedMember && (
        <RemoveOrganizationMemberModal
          isOpen={isRemoveMemberModalOpen}
          onClose={() => setIsRemoveMemberModalOpen(false)}
          organizationId={org.id}
          organizationName={org.name}
          memberName={selectedMember.user.username || selectedMember.user.email}
          memberEmail={selectedMember.user.email}
          memberId={selectedMember.userId}
          onMemberRemoved={handleMemberRemoved}
        />
      )}

      {selectedTeam && (
        <TeamDetailModal
          isOpen={isTeamDetailModalOpen}
          onClose={() => setIsTeamDetailModalOpen(false)}
          team={selectedTeam}
          onInviteSent={handleInviteSent}
        />
      )}

      <EditOrganizationModal org={org} handlers={handlers} />
      <EditTeamModal handlers={handlers} />
    </>
  );
}
