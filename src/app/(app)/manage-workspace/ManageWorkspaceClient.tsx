"use client";
import { useToast } from "@/components/ui/use-toast";
import { useRef, FormEvent, useState } from "react";
import CreateOrganizationModal from "./CreateOrganizationModal";
import OrganizationCard from "./OrganizationCard";
import { Button } from "@/components/ui/button";
import { IconPlus, IconBuilding } from "@tabler/icons-react";

// Type definitions  
interface User {
  id: string;
  name?: string | null;
  email: string | null;
  username?: string | null;
}

interface Organization {
  id: string;
  name: string;
  userRole: "OWNER" | "MANAGER" | "MEMBER";
  teams: any[];
  members: any[];
}

interface Team {
  id: string;
  name: string;
  organizationId: string | null;
}

interface ManageWorkspaceClientProps {
  organizations: Organization[];
  user: User;
}

export default function ManageWorkspaceClient({
  organizations,
  user,
}: ManageWorkspaceClientProps) {
  const { toast } = useToast();
  const orgDialogRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [editOrgId, setEditOrgId] = useState<string | null>(null);
  const [editOrgName, setEditOrgName] = useState("");
  const [editTeamId, setEditTeamId] = useState<string | null>(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamOrgId, setEditTeamOrgId] = useState<string | null>(null);

  // Handler functions
  async function handleCreateOrg(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const orgName = (form.orgName as HTMLInputElement).value.trim();
    if (!orgName || !user) return;
    const result = await (
      await import("./actions")
    ).createOrganization(orgName, user.id);
    if (result && result.success) {
      toast({ title: "Organization created!", description: orgName });
      form.reset();
      orgDialogRefs.current["org"]?.click();
      window.location.reload();
    } else {
      toast({
        title: "Error",
        description: result?.message || "Unknown error",
        variant: "destructive",
      });
    }
  }

  async function handleCreateTeam(
    e: FormEvent<HTMLFormElement>,
    orgId: string,
  ) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const teamName = (form.teamName as HTMLInputElement).value.trim();
    if (!teamName || !user) return;
    const result = await (
      await import("./actions")
    ).createTeam(teamName, user.id, orgId);
    if (result && result.success) {
      toast({ title: "Team created!", description: teamName });
      form.reset();
      orgDialogRefs.current[orgId]?.click();
      window.location.reload();
    } else {
      toast({
        title: "Error",
        description: result?.message || "Unknown error",
        variant: "destructive",
      });
    }
  }

  async function handleEditOrg(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editOrgId || !user) return;
    const result = await (
      await import("./actions")
    ).editOrganization(editOrgId, editOrgName, user.id);
    if (result && result.success) {
      toast({ title: "Organization updated!", description: editOrgName });
      setEditOrgId(null);
      setEditOrgName("");
      window.location.reload();
    } else {
      toast({
        title: "Error",
        description: result?.message || "Unknown error",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteOrg(orgId: string) {
    if (!user) return;
    const result = await (
      await import("./actions")
    ).deleteOrganization(orgId, user.id);
    if (result && result.success) {
      toast({ title: "Organization deleted!" });
      window.location.reload();
    } else {
      toast({
        title: "Error",
        description: result?.message || "Unknown error",
        variant: "destructive",
      });
    }
  }

  async function handleEditTeam(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editTeamId || !editTeamOrgId) return;
    const result = await (
      await import("./actions")
    ).editTeam(editTeamId, editTeamName, editTeamOrgId);
    if (result && result.success) {
      toast({ title: "Team updated!", description: editTeamName });
      setEditTeamId(null);
      setEditTeamName("");
      setEditTeamOrgId(null);
      window.location.reload();
    } else {
      toast({
        title: "Error",
        description: result?.message || "Unknown error",
        variant: "destructive",
      });
    }
  }

  async function handleDeleteTeam(teamId: string) {
    const result = await (await import("./actions")).deleteTeam(teamId);
    if (result && result.success) {
      toast({ title: "Team deleted!" });
      window.location.reload();
    } else {
      toast({
        title: "Error",
        description: result?.message || "Unknown error",
        variant: "destructive",
      });
    }
  }

  // Handler object to pass down
  const handlers = {
    // For CreateOrganizationModal
    onCreateOrg: handleCreateOrg,

    // For OrganizationCard interface
    onEditOrg: (org: Organization) => {
      setEditOrgId(org.id);
      setEditOrgName(org.name);
    },
    onDeleteOrg: handleDeleteOrg,
    onCreateTeam: async (orgId: string, teamName: string) => {
      if (!user) return;
      const result = await (
        await import("./actions")
      ).createTeam(teamName, user.id, orgId);
      if (result && result.success) {
        toast({ title: "Team created!", description: teamName });
        window.location.reload();
      } else {
        toast({
          title: "Error",
          description: result?.message || "Unknown error",
          variant: "destructive",
        });
      }
    },
    onDeleteTeam: handleDeleteTeam,

    // For CreateTeamModal (legacy form-based handler)
    onCreateTeamForm: handleCreateTeam,

    // For EditOrganizationModal and EditTeamModal (if needed)
    onEditOrgSubmit: handleEditOrg,
    onEditTeam: (team: Team, orgId: string) => {
      setEditTeamId(team.id);
      setEditTeamName(team.name);
      setEditTeamOrgId(orgId);
    },
    onEditTeamSubmit: handleEditTeam,
    onCloseEditOrg: () => {
      setEditOrgId(null);
      setEditOrgName("");
    },
    onCloseEditTeam: () => {
      setEditTeamId(null);
      setEditTeamName("");
      setEditTeamOrgId(null);
    },
    editOrgId,
    editOrgName,
    setEditOrgName,
    editTeamId,
    editTeamName,
    setEditTeamName,
  };

  return (
    <div className="space-y-8">
      {/* Quick Actions */}
      <div className="flex flex-col justify-center gap-4 sm:flex-row">
        <CreateOrganizationModal handlers={handlers} />
      </div>

      {/* Organizations List */}
      {organizations.length > 0 ? (
        <div className="space-y-6">
          {organizations.map((org) => (
            <OrganizationCard
              key={org.id}
              org={org}
              user={user}
              handlers={handlers}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="rounded-full bg-muted/30 p-6">
              <IconBuilding className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No Organizations</h3>
              <p className="max-w-md text-muted-foreground">
                You haven't created or joined any organizations yet. Create your
                first organization to start collaborating with your team.
              </p>
            </div>
            <CreateOrganizationModal handlers={handlers} />
          </div>
        </div>
      )}
    </div>
  );
}
