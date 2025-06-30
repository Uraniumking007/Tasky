"use client";

import { useSession } from "next-auth/react";
import { api } from "@/trpc/react";
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
import { toast } from "@/components/ui/use-toast";
import {
  Mail,
  Clock,
  X,
  RefreshCw,
  Loader2,
  AlertTriangle,
} from "lucide-react";

interface ViewTeamInvitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

interface TeamInvite {
  id: string;
  email: string;
  status: string;
  createdAt: Date;
  expiry: Date;
  isExpired: boolean;
  inviter: {
    name: string | null;
    email: string | null;
    username: string | null;
  } | null;
}

export default function ViewTeamInvitesModal({
  isOpen,
  onClose,
  teamId,
  teamName,
}: ViewTeamInvitesModalProps) {
  // TanStack Query for fetching invitations
  const {
    data: invites = [],
    isLoading,
    refetch,
    isRefetching,
  } = api.teamInvites.getTeamInvites.useQuery(
    { teamId },
    {
      enabled: isOpen,
      refetchOnWindowFocus: false,
    },
  );

  // TanStack Query mutation for cancelling invitation
  const cancelInvitationMutation = api.teamInvites.cancelInvitation.useMutation(
    {
      onSuccess: () => {
        toast({
          title: "Invitation cancelled",
          description: "The invitation has been cancelled",
        });
        // Refetch the invitations list
        refetch();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message || "Failed to cancel invitation",
          variant: "destructive",
        });
      },
    },
  );

  const handleCancelInvite = (inviteId: string) => {
    cancelInvitationMutation.mutate({ inviteId });
  };

  const getStatusBadge = (invite: TeamInvite) => {
    if (invite.isExpired) {
      return <Badge variant="destructive">Expired</Badge>;
    }

    switch (invite.status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "accepted":
        return <Badge variant="default">Accepted</Badge>;
      case "declined":
        return <Badge variant="outline">Declined</Badge>;
      case "cancelled":
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{invite.status}</Badge>;
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeUntilExpiry = (expiry: Date) => {
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

  const pendingInvites = invites.filter(
    (invite) => invite.status === "pending" && !invite.isExpired,
  );
  const expiredInvites = invites.filter((invite) => invite.isExpired);
  const otherInvites = invites.filter(
    (invite) => invite.status !== "pending" && !invite.isExpired,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Team Invitations
          </DialogTitle>
          <DialogDescription>
            Manage invitations for team "{teamName}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Active Invitations</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
            >
              {isRefetching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : pendingInvites.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active invitations
            </p>
          ) : (
            <div className="space-y-2">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-md border bg-muted/30 p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{invite.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>Invited {formatDate(invite.createdAt)}</span>
                      <span>•</span>
                      <span
                        className={
                          getTimeUntilExpiry(invite.expiry) === "Expired"
                            ? "text-red-500"
                            : ""
                        }
                      >
                        {getTimeUntilExpiry(invite.expiry)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invite)}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCancelInvite(invite.id)}
                      disabled={cancelInvitationMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {expiredInvites.length > 0 && (
            <div className="space-y-2">
              <h4 className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                Expired Invitations
              </h4>
              {expiredInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-md border bg-orange-50 p-3 dark:bg-orange-950/20"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{invite.email}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Expired on {formatDate(invite.expiry)}
                    </div>
                  </div>
                  {getStatusBadge(invite)}
                </div>
              ))}
            </div>
          )}

          {otherInvites.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Other Invitations</h4>
              {otherInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between rounded-md border bg-muted/10 p-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{invite.email}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(invite.createdAt)}
                    </div>
                  </div>
                  {getStatusBadge(invite)}
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
