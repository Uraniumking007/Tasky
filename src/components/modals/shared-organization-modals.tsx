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
import { UserPlus, Mail, Loader2, UserMinus, Trash2 } from "lucide-react";

interface AddOrganizationMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName: string;
  onInviteSent?: () => void;
}

export function AddOrganizationMemberModal({
  isOpen,
  onClose,
  organizationId,
  organizationName,
  onInviteSent,
}: AddOrganizationMemberModalProps) {
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const utils = api.useUtils();

  const inviteMemberMutation = api.organization.inviteMember.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Invitation sent",
        description: data.message,
      });
      setEmail("");
      onClose();
      onInviteSent?.();
      // Invalidate and refetch organization data
      utils.organization.getOrganization.invalidate({ organizationId });
      utils.organization.getInvites.invalidate({ organizationId });
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
      organizationId,
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
            Add Organization Member
          </DialogTitle>
          <DialogDescription>
            Invite someone to join &quot;{organizationName}&quot; organization.
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

interface RemoveOrganizationMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  organizationName: string;
  memberName: string;
  memberEmail: string;
  memberId: string;
  onMemberRemoved?: () => void;
}

export function RemoveOrganizationMemberModal({
  isOpen,
  onClose,
  organizationId,
  organizationName,
  memberName,
  memberEmail,
  memberId,
  onMemberRemoved,
}: RemoveOrganizationMemberModalProps) {
  const { toast } = useToast();
  const utils = api.useUtils();

  const removeMemberMutation = api.organization.removeMember.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Member removed",
        description: data.message,
      });
      onClose();
      onMemberRemoved?.();
      // Invalidate and refetch organization data
      utils.organization.getOrganization.invalidate({ organizationId });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRemove = () => {
    removeMemberMutation.mutate({
      organizationId,
      userId: memberId,
    });
  };

  const handleClose = () => {
    if (!removeMemberMutation.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserMinus className="h-5 w-5 text-destructive" />
            Remove Member
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {memberName} ({memberEmail}) from
            &quot;
            {organizationName}&quot;?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. The member will lose access to all
            teams and resources within this organization.
          </p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={removeMemberMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={removeMemberMutation.isPending}
          >
            {removeMemberMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove Member
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
