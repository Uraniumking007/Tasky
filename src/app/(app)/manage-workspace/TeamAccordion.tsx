"use client";
import { useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserPlus, Users, Mail } from "lucide-react";
import { AddTeamMemberModal } from "@/components/modals/shared-team-modals";
import ViewTeamInvitesModal from "@/components/modals/view-team-invites-modal";

export default function TeamAccordion({
  teams,
  handlers,
}: {
  teams: any[];
  handlers: any;
}) {
  const [selectedTeam, setSelectedTeam] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewInvitesModalOpen, setIsViewInvitesModalOpen] = useState(false);

  if (!teams || teams.length === 0) {
    return (
      <div className="text-muted-foreground">
        No teams in this organization.
      </div>
    );
  }

  const handleAddMember = (team: any) => {
    setSelectedTeam({ id: team.id, name: team.name });
    setIsAddModalOpen(true);
  };

  const handleViewInvites = (team: any) => {
    setSelectedTeam({ id: team.id, name: team.name });
    setIsViewInvitesModalOpen(true);
  };

  const handleInviteSent = () => {
    // Refresh the page or update the data
    window.location.reload();
  };

  return (
    <TooltipProvider>
      <Accordion type="multiple" className="w-full">
        {teams.map((team) => (
          <AccordionItem value={team.id} key={team.id}>
            <AccordionTrigger>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{team.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    <Users className="mr-1 h-3 w-3" />
                    {team.members.length} member
                    {team.members.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  Team ID: {team.id}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Team Members</h4>
                  {team.members.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No members yet. Invite someone to get started!
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {team.members.map((member: any) => (
                        <li
                          key={member.id}
                          className="flex items-center justify-between rounded-md bg-muted/50 p-2"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {member.user.username || member.user.email}
                            </span>
                          </div>
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
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleAddMember(team)}
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewInvites(team)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>View invitations</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {selectedTeam && (
        <>
          <AddTeamMemberModal
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            teamId={selectedTeam.id}
            teamName={selectedTeam.name}
            onInviteSent={handleInviteSent}
          />
          <ViewTeamInvitesModal
            isOpen={isViewInvitesModalOpen}
            onClose={() => setIsViewInvitesModalOpen(false)}
            teamId={selectedTeam.id}
            teamName={selectedTeam.name}
          />
        </>
      )}
    </TooltipProvider>
  );
}
