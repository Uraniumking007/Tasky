"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Mail,
  Building2,
  UserPlus,
  Loader2,
  X,
  Send,
  Copy,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { api } from "@/trpc/react";

interface EditOrganizationModalProps {
  organizationId: string;
  organizationName: string;
  canEdit: boolean;
}

export function EditOrganizationModal({
  organizationId,
  organizationName,
  canEdit,
}: EditOrganizationModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(organizationName);
  const { toast } = useToast();
  const utils = api.useUtils();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(organizationName);
    }
  }, [isOpen, organizationName]);

  const editOrganizationMutation =
    api.organization.editOrganization.useMutation({
      onSuccess: (data) => {
        toast({
          title: "Success",
          description: data.message,
        });
        setIsOpen(false);
        // Invalidate and refetch organization data
        utils.organization.getOrganization.invalidate({ organizationId });
        utils.workspace.getWorkspaceData.invalidate();
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
    if (!name.trim()) return;

    editOrganizationMutation.mutate({
      organizationId,
      name: name.trim(),
    });
  };

  if (!canEdit) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Building2 className="mr-2 h-4 w-4" />
          Edit Organization
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
          <DialogDescription>
            Update the organization name and settings.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Organization Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter organization name"
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={editOrganizationMutation.isPending}>
              {editOrganizationMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface InviteMemberModalProps {
  organizationId: string;
  canInvite: boolean;
}

export function InviteMemberModal({
  organizationId,
  canInvite,
}: InviteMemberModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const utils = api.useUtils();

  const inviteMutation = api.organization.inviteMember.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      setEmail("");
      setIsOpen(false);
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

    inviteMutation.mutate({
      organizationId,
      email: email.trim(),
    });
  };

  if (!canInvite) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Mail className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Organization Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join this organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface CreateTeamModalProps {
  organizationId: string;
  canCreate: boolean;
}

export function CreateTeamModal({
  organizationId,
  canCreate,
}: CreateTeamModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const { toast } = useToast();
  const utils = api.useUtils();

  const createTeamMutation = api.organization.createTeam.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      setTeamName("");
      setIsOpen(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;

    createTeamMutation.mutate({
      organizationId,
      teamName: teamName.trim(),
    });
  };

  if (!canCreate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Building2 className="mr-2 h-4 w-4" />
          Create Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Team</DialogTitle>
          <DialogDescription>
            Create a new team within this organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                required
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createTeamMutation.isPending}>
              {createTeamMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Team
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AddTeamMemberModalProps {
  teamId: string;
  organizationId: string;
  canAdd: boolean;
}

export function AddTeamMemberModal({
  teamId,
  organizationId,
  canAdd,
}: AddTeamMemberModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [email, setEmail] = useState("");
  const [mode, setMode] = useState<"existing" | "invite">("existing");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const utils = api.useUtils();

  // Fetch available members when modal opens
  const { data: availableMembers, isLoading: isLoadingMembers } =
    api.organization.getAvailableMembers.useQuery(
      { organizationId, teamId },
      { enabled: isOpen && mode === "existing" },
    );

  // Filter members based on search term
  const filteredMembers = availableMembers?.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.email &&
        member.email.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const addMemberMutation = api.organization.addTeamMember.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      setSelectedUserIds([]);
      setIsOpen(false);
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

  const inviteToTeamMutation = api.organization.inviteToTeam.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      setEmail("");
      setIsOpen(false);
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

  const handleMemberToggle = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSelectAll = () => {
    if (!filteredMembers) return;
    if (selectedUserIds.length === filteredMembers.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(filteredMembers.map((member) => member.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "existing") {
      if (selectedUserIds.length === 0) return;

      // Add members one by one
      for (const userId of selectedUserIds) {
        try {
          await addMemberMutation.mutateAsync({
            teamId,
            userId,
          });
        } catch (error) {
          // Error handling is already done in the mutation
          break;
        }
      }
    } else {
      if (!email.trim()) return;
      inviteToTeamMutation.mutate({
        organizationId,
        teamId,
        email: email.trim(),
      });
    }
  };

  if (!canAdd) return null;

  const isPending =
    addMemberMutation.isPending || inviteToTeamMutation.isPending;

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Reset form when dialog closes
      setSelectedUserIds([]);
      setEmail("");
      setSearchTerm("");
      setMode("existing");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <UserPlus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>
            Add an existing organization member or invite someone new.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label>How would you like to add a member?</Label>
              <Select
                value={mode}
                onValueChange={(value: "existing" | "invite") => setMode(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="existing">
                    Add existing organization member
                  </SelectItem>
                  <SelectItem value="invite">Invite new person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {mode === "existing" ? (
              <div className="space-y-3">
                <Label>Select Members</Label>

                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search members..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {isLoadingMembers ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Select All Checkbox */}
                    {filteredMembers && filteredMembers.length > 0 && (
                      <div className="flex items-center space-x-2 border-b pb-2">
                        <Checkbox
                          id="select-all"
                          checked={
                            selectedUserIds.length === filteredMembers.length
                          }
                          onCheckedChange={handleSelectAll}
                        />
                        <Label
                          htmlFor="select-all"
                          className="text-sm font-medium"
                        >
                          Select All ({filteredMembers.length})
                        </Label>
                      </div>
                    )}

                    {/* Member List with Checkboxes */}
                    <div className="max-h-48 space-y-2 overflow-y-auto">
                      {filteredMembers?.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted"
                        >
                          <Checkbox
                            id={`member-${member.id}`}
                            checked={selectedUserIds.includes(member.id)}
                            onCheckedChange={() =>
                              handleMemberToggle(member.id)
                            }
                          />
                          <Label
                            htmlFor={`member-${member.id}`}
                            className="flex flex-1 cursor-pointer items-center gap-2"
                          >
                            <span>{member.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {member.role}
                            </Badge>
                          </Label>
                        </div>
                      ))}

                      {filteredMembers?.length === 0 &&
                        availableMembers?.length === 0 && (
                          <div className="py-4 text-center text-muted-foreground">
                            No available members
                          </div>
                        )}

                      {filteredMembers?.length === 0 &&
                        availableMembers &&
                        availableMembers.length > 0 && (
                          <div className="py-4 text-center text-muted-foreground">
                            No members match your search
                          </div>
                        )}
                    </div>

                    {/* Selected count */}
                    {selectedUserIds.length > 0 && (
                      <div className="pt-2 text-sm text-muted-foreground">
                        {selectedUserIds.length} member
                        {selectedUserIds.length !== 1 ? "s" : ""} selected
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isPending ||
                (mode === "existing" && selectedUserIds.length === 0)
              }
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "existing"
                ? `Add ${selectedUserIds.length} Member${selectedUserIds.length !== 1 ? "s" : ""}`
                : "Send Invitation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface RemoveMemberButtonProps {
  organizationId: string;
  memberUserId: string;
  memberName: string;
  canRemove: boolean;
}

export function RemoveMemberButton({
  organizationId,
  memberUserId,
  memberName,
  canRemove,
}: RemoveMemberButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const utils = api.useUtils();

  const removeMemberMutation = api.organization.removeMember.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      setIsOpen(false);
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

  const handleRemove = async () => {
    removeMemberMutation.mutate({
      organizationId,
      memberUserId,
    });
  };

  if (!canRemove) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <X className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Member</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove {memberName} from this organization?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={removeMemberMutation.isPending}
          >
            {removeMemberMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Remove Member
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ViewInvitesModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  canManageInvites: boolean;
}

export function ViewInvitesModal({
  isOpen,
  onClose,
  organizationId,
  canManageInvites,
}: ViewInvitesModalProps) {
  const { toast } = useToast();

  // Fetch invites when modal is open
  const {
    data: invites,
    isLoading,
    refetch,
  } = api.organization.getInvites.useQuery(
    { organizationId },
    {
      enabled: isOpen && canManageInvites,
      refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    },
  );

  const cancelInviteMutation = api.organization.cancelInvite.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const resendInviteMutation = api.organization.resendInvite.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      refetch();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "accepted":
        return <Badge variant="default">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      case "expired":
        return <Badge variant="destructive">Expired</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const isExpired = (expiry: string | Date) => {
    const expiryDate = typeof expiry === "string" ? new Date(expiry) : expiry;
    return expiryDate < new Date();
  };

  const handleCancelInvite = async (inviteId: string) => {
    cancelInviteMutation.mutate({ inviteId });
  };

  const handleResendInvite = async (inviteId: string) => {
    resendInviteMutation.mutate({ inviteId });
  };

  const copyInviteUrl = (inviteId: string) => {
    const url = `${window.location.origin}/invite/organization/${inviteId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied!",
      description: "Invite URL copied to clipboard",
    });
  };

  if (!canManageInvites) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Organization Invites</DialogTitle>
          <DialogDescription>
            Manage pending and past invitations to this organization.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : invites && invites.length > 0 ? (
          <div className="space-y-4">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{invite.email}</span>
                    {getStatusBadge(invite.status)}
                    {isExpired(invite.expiry) &&
                      invite.status === "pending" && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Invited by {invite.inviterName} on{" "}
                    {new Date(invite.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Expires: {new Date(invite.expiry).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {invite.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyInviteUrl(invite.id)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResendInvite(invite.id)}
                        disabled={resendInviteMutation.isPending}
                      >
                        {resendInviteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleCancelInvite(invite.id)}
                        disabled={cancelInviteMutation.isPending}
                      >
                        {cancelInviteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No invites found for this organization.
          </div>
        )}

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ViewInvitesButtonProps {
  organizationId: string;
  canManageInvites: boolean;
}

export function ViewInvitesButton({
  organizationId,
  canManageInvites,
}: ViewInvitesButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!canManageInvites) return null;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}>
        View Invites
      </Button>
      <ViewInvitesModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        organizationId={organizationId}
        canManageInvites={canManageInvites}
      />
    </>
  );
}

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
  organizationId: string;
}

export function EditTeamModal({
  isOpen,
  onClose,
  teamId,
  teamName,
  organizationId,
}: EditTeamModalProps) {
  const [name, setName] = useState(teamName);
  const { toast } = useToast();
  const utils = api.useUtils();

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName(teamName);
    }
  }, [isOpen, teamName]);

  const editTeamMutation = api.team.editTeam.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data.message,
      });
      onClose();
      // Invalidate and refetch organization data
      utils.organization.getOrganization.invalidate({ organizationId });
      utils.workspace.getWorkspaceData.invalidate();
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
    if (!name.trim()) return;

    editTeamMutation.mutate({
      teamId,
      name: name.trim(),
    });
  };

  const handleClose = () => {
    if (!editTeamMutation.isPending) {
      setName(teamName);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Team</DialogTitle>
          <DialogDescription>
            Update the team name. This will be visible to all team members.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter team name"
                required
                disabled={editTeamMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={editTeamMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={editTeamMutation.isPending}>
              {editTeamMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditTeamButtonProps {
  teamId: string;
  teamName: string;
  organizationId: string;
  canEdit: boolean;
}

export function EditTeamButton({
  teamId,
  teamName,
  organizationId,
  canEdit,
}: EditTeamButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!canEdit) return null;

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setIsOpen(true)}>
        Edit
      </Button>
      <EditTeamModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        teamId={teamId}
        teamName={teamName}
        organizationId={organizationId}
      />
    </>
  );
}
