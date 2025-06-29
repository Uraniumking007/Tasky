"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Loader2 } from "lucide-react";

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  onInviteSent?: () => void;
}

export function AddTeamMemberModal({
  isOpen,
  onClose,
  teamId,
  teamName,
  onInviteSent,
}: AddTeamMemberModalProps) {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const utils = api.useUtils();

  const inviteMemberMutation = api.team.inviteMember.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Invitation sent",
        description: data.message,
      });
      setEmail("");
      onClose();
      onInviteSent?.();
      // Invalidate and refetch team data
      utils.team.getTeam.invalidate({ teamId });
      utils.teamInvites.getTeamInvites.invalidate({ teamId });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) return;

    inviteMemberMutation.mutate({
      teamId,
      email: email.trim(),
    });
  };

  const handleClose = () => {
    if (!inviteMemberMutation.isPending) {
      setEmail("");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Team Member
          </DialogTitle>
          <DialogDescription>
            Invite someone to join "{teamName}" team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={inviteMemberMutation.isPending}
              placeholder="Enter email address"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={inviteMemberMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMemberMutation.isPending}>
              {inviteMemberMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
