"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Mail,
  Calendar,
  Hash,
  Crown,
  Shield,
  User,
} from "lucide-react";
import { AddTeamMemberModal } from "./shared-team-modals";
import ViewTeamInvitesModal from "./view-team-invites-modal";
import { Separator } from "@/components/ui/separator";
import { api } from "@/trpc/react";

interface TeamDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: {
    id: string;
    name: string;
    createdAt?: Date | string;
    members: {
      id: string;
      role: string;
      user: { username?: string | null; email: string | null };
    }[];
  };
  onInviteSent: () => void;
}

export default function TeamDetailModal({
  isOpen,
  onClose,
  team,
  onInviteSent,
}: TeamDetailModalProps) {
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isViewInvitesModalOpen, setIsViewInvitesModalOpen] = useState(false);

  // TanStack Query for invalidating queries when invitations are sent
  const utils = api.useUtils();

  const handleInviteSent = () => {
    // Invalidate and refetch team data
    utils.teamInvites.getTeamInvites.invalidate({ teamId: team.id });
    onInviteSent();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown className="h-4 w-4 text-yellow-600" />;
      case "MANAGER":
        return <Shield className="h-4 w-4 text-blue-600" />;
      default:
        return <User className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "OWNER":
        return "default";
      case "MANAGER":
        return "secondary";
      default:
        return "outline";
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getTimeUntilExpiry = (expiryString: string) => {
    const expiry = new Date(expiryString);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) {
      return "Expired";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) {
      return `${days} day${days !== 1 ? "s" : ""} left`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""} left`;
    } else {
      return "Less than 1 hour left";
    }
  };

  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6 text-primary" />
              {team.name}
            </DialogTitle>
            <DialogDescription>
              Team details and member management
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Team Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Team Information</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span>Team ID: {team.id}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Created:{" "}
                      {team.createdAt ? formatDate(team.createdAt) : "Unknown"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {team.members.length} member
                      {team.members.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Team Members */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Team Members</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsViewInvitesModalOpen(true)}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    View Invitations
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsAddMemberModalOpen(true)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                </div>
              </div>

              {team.members.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
                  <h4 className="mb-2 font-semibold">No members yet</h4>
                  <p className="mb-4">
                    Invite team members to start collaborating
                  </p>
                  <Button onClick={() => setIsAddMemberModalOpen(true)}>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite First Member
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {team.members.map(
                    (member: {
                      id: string;
                      role: string;
                      user: { username?: string | null; email: string | null };
                    }) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/30 p-4"
                      >
                        <div className="flex items-center gap-3">
                          {getRoleIcon(member.role)}
                          <div>
                            <div className="font-medium">
                              {member.user.username ||
                                member.user.email ||
                                "Unknown"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {member.user.email || "No email"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={getRoleBadgeVariant(member.role)}>
                            {member.role}
                          </Badge>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>

            {/* Team Statistics */}
            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Team Statistics</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-muted/30 p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {team.members.length}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Members
                  </div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {team.members.filter((m) => m.role === "MANAGER").length}
                  </div>
                  <div className="text-sm text-muted-foreground">Managers</div>
                </div>
                <div className="rounded-lg border bg-muted/30 p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      team.members.filter(
                        (m: { role: string }) => m.role === "MEMBER",
                      ).length
                    }
                  </div>
                  <div className="text-sm text-muted-foreground">Members</div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddTeamMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        teamId={team.id}
        teamName={team.name}
        onInviteSent={handleInviteSent}
      />

      <ViewTeamInvitesModal
        isOpen={isViewInvitesModalOpen}
        onClose={() => setIsViewInvitesModalOpen(false)}
        teamId={team.id}
        teamName={team.name}
      />
    </>
  );
}
