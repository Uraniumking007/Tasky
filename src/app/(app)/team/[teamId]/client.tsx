"use client";

import { useState, useEffect } from "react";
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
import { toast } from "@/components/ui/use-toast";
import {
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  UserPlus,
  Mail,
  UserMinus,
  Settings,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/trpc/react";
import { Switch } from "@/components/ui/switch";

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  currentName: string;
}

export function EditTeamModal({
  isOpen,
  onClose,
  teamId,
  currentName,
}: EditTeamModalProps) {
  const [teamName, setTeamName] = useState(currentName);
  const utils = api.useUtils();

  const editTeamMutation = api.team.editTeam.useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (_data) => {
      toast({
        title: "Success",
        description: "Team updated successfully",
      });
      onClose();
      // Invalidate and refetch team data
      utils.team.getTeam.invalidate({ teamId });
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

    if (!teamName.trim() || teamName.trim() === currentName) {
      onClose();
      return;
    }

    editTeamMutation.mutate({
      teamId,
      name: teamName.trim(),
    });
  };

  const handleClose = () => {
    if (!editTeamMutation.isPending) {
      setTeamName(currentName);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Team
          </DialogTitle>
          <DialogDescription>
            Update the team name. This will be visible to all team members.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={editTeamMutation.isPending}
              placeholder="Enter team name"
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={editTeamMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={editTeamMutation.isPending}>
              {editTeamMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Update Team
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

export function DeleteTeamModal({
  isOpen,
  onClose,
  teamId,
  teamName,
}: DeleteTeamModalProps) {
  const router = useRouter();

  const deleteTeamMutation = api.team.deleteTeam.useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (_data) => {
      toast({
        title: "Team deleted",
        description: "Team has been deleted successfully",
      });
      onClose();
      // Redirect to home
      router.push("/home");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDelete = async () => {
    deleteTeamMutation.mutate({ teamId });
  };

  const handleClose = () => {
    if (!deleteTeamMutation.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Delete Team
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the team
            &quot;{teamName}&quot; and remove all associated data.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-destructive/10 p-4">
          <p className="text-sm font-medium text-destructive">
            Warning: All team data will be lost
          </p>
          <ul className="mt-2 list-inside list-disc text-sm text-destructive/80">
            <li>All team members will be removed</li>
            <li>Team tasks and data will be deleted</li>
            <li>This action cannot be undone</li>
          </ul>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={deleteTeamMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteTeamMutation.isPending}
          >
            {deleteTeamMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Team
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

export function AddTeamMemberModal({
  isOpen,
  onClose,
  teamId,
  teamName,
}: AddTeamMemberModalProps) {
  const [email, setEmail] = useState("");
  const utils = api.useUtils();

  const inviteMemberMutation = api.team.inviteMember.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Invitation sent",
        description: data.message,
      });
      setEmail("");
      onClose();
      // Invalidate and refetch team data
      utils.team.getTeam.invalidate({ teamId });
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
            Invite someone to join &quot;{teamName}&quot; team.
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

interface EditTeamButtonProps {
  teamId: string;
  teamName: string;
}

export function EditTeamButton({ teamId, teamName }: EditTeamButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Edit className="mr-2 h-4 w-4" />
        Edit Team
      </Button>
      <EditTeamModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        teamId={teamId}
        currentName={teamName}
      />
    </>
  );
}

interface DeleteTeamButtonProps {
  teamId: string;
  teamName: string;
}

export function DeleteTeamButton({ teamId, teamName }: DeleteTeamButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setIsOpen(true)}>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Team
      </Button>
      <DeleteTeamModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        teamId={teamId}
        teamName={teamName}
      />
    </>
  );
}

interface AddMemberButtonProps {
  teamId: string;
  teamName: string;
}

export function AddMemberButton({ teamId, teamName }: AddMemberButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setIsOpen(true)}>
        <UserPlus className="mr-2 h-4 w-4" />
        Add Member
      </Button>
      <AddTeamMemberModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        teamId={teamId}
        teamName={teamName}
      />
    </>
  );
}

interface RemoveMemberButtonProps {
  teamId: string;
  memberUserId: string;
  memberName: string;
}

export function RemoveMemberButton({
  teamId,
  memberUserId,
  memberName,
}: RemoveMemberButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const utils = api.useUtils();

  const removeMemberMutation = api.team.removeMember.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Member removed",
        description: data.message,
      });
      setIsOpen(false);
      // Invalidate and refetch team data
      utils.team.getTeam.invalidate({ teamId });
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
      teamId,
      userId: memberUserId,
    });
  };

  return (
    <>
      <Button variant="destructive" size="sm" onClick={() => setIsOpen(true)}>
        <UserMinus className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove &quot;{memberName}&quot; from this
              team? This action cannot be undone.
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
    </>
  );
}

interface ManageTeamSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  teamName: string;
}

export function ManageTeamSettingsModal({
  isOpen,
  onClose,
  teamId,
  teamName,
}: ManageTeamSettingsModalProps) {
  const [newTeamName, setNewTeamName] = useState(teamName);
  const [isPrivate, setIsPrivate] = useState(false);
  const [autoJoin, setAutoJoin] = useState(true);
  const utils = api.useUtils();

  // Get current team data to populate form
  const { data: teamData } = api.team.getTeam.useQuery(
    { teamId },
    { enabled: isOpen },
  );

  // Reset form when modal opens or team data changes
  useEffect(() => {
    if (isOpen && teamData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const team = teamData.team as any; // Temporary type assertion until Prisma types update
      setNewTeamName(team.name);
      setIsPrivate(team.isPrivate || false);
      setAutoJoin(team.allowAutoJoin !== false); // Default to true if undefined
    }
  }, [isOpen, teamData]);

  const updateSettingsMutation = api.team.editTeam.useMutation({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onSuccess: (_data) => {
      toast({
        title: "Settings updated",
        description: "Team settings have been updated successfully",
      });
      // Invalidate and refetch team data
      utils.team.getTeam.invalidate({ teamId });
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

    if (!newTeamName.trim()) {
      toast({
        title: "Error",
        description: "Team name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    updateSettingsMutation.mutate({
      teamId,
      name: newTeamName.trim(),
      isPrivate,
      allowAutoJoin: autoJoin,
    });
  };

  const handleClose = () => {
    if (!updateSettingsMutation.isPending) {
      setNewTeamName(teamName);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manage Team Settings
          </DialogTitle>
          <DialogDescription>
            Configure team settings and preferences for &quot;{teamName}&quot;.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Settings</h3>

            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                disabled={updateSettingsMutation.isPending}
                placeholder="Enter team name"
              />
              <p className="text-sm text-muted-foreground">
                This is the display name for your team.
              </p>
            </div>
          </div>

          {/* Team Visibility (Future feature placeholder) */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Team Visibility</h3>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="private-team">Private Team</Label>
                <p className="text-sm text-muted-foreground">
                  Only invited members can see and join this team
                </p>
              </div>
              <Switch
                id="private-team"
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
                disabled={updateSettingsMutation.isPending}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="auto-join">Allow Auto Join</Label>
                <p className="text-sm text-muted-foreground">
                  Organization members can join without invitation
                </p>
              </div>
              <Switch
                id="auto-join"
                checked={autoJoin}
                onCheckedChange={setAutoJoin}
                disabled={updateSettingsMutation.isPending}
              />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-destructive">
              Danger Zone
            </h3>

            <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Delete Team</h4>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete this team and all associated data
                  </p>
                </div>
                <DeleteTeamButton teamId={teamId} teamName={teamName} />
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateSettingsMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateSettingsMutation.isPending}>
              {updateSettingsMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Settings className="mr-2 h-4 w-4" />
                  Update Settings
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ManageSettingsButtonProps {
  teamId: string;
  teamName: string;
  canManage: boolean;
}

export function ManageSettingsButton({
  teamId,
  teamName,
  canManage,
}: ManageSettingsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!canManage) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => setIsOpen(true)}
      >
        Manage Settings
      </Button>
      <ManageTeamSettingsModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        teamId={teamId}
        teamName={teamName}
      />
    </>
  );
}
