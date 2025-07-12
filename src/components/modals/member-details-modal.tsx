"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotesList } from "@/components/notes/notes-list";
import {
  User,
  Mail,
  Calendar,
  // Shield,
  Users,
  Building2,
  FileText,
  Loader2,
  UserCheck,
} from "lucide-react";

interface MemberDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  teamId?: string;
  organizationId?: string;
  currentUserRole?: "OWNER" | "MANAGER" | "TEAM_LEAD" | "MEMBER";
  canManageNotes?: boolean;
}

// interface MemberDetails {
//   id: string;
//   name: string | null;
//   email: string | null;
//   username: string | null;
//   createdAt: string;
//   teamMemberships: Array<{
//     id: string;
//     role: string;
//     team: {
//       id: string;
//       name: string;
//     };
//   }>;
//   organizationMemberships: Array<{
//     id: string;
//     role: string;
//     organization: {
//       id: string;
//       name: string;
//     };
//   }>;
// }

export function MemberDetailsModal({
  isOpen,
  onClose,
  memberId,
  memberName,
  memberEmail,
  teamId,
  organizationId,
  currentUserRole = "MEMBER",
  canManageNotes = false,
}: MemberDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("details");

  // Get member details
  const {
    data: memberDetails,
    isLoading: isLoadingDetails,
    error: detailsError,
  } = api.users.getMemberDetails.useQuery(
    {
      userId: memberId,
      teamId,
      organizationId, // Pass organizationId when available
    },
    {
      enabled: isOpen && !!memberId,
      retry: 1,
    },
  );

  const canCreateNotes =
    canManageNotes &&
    (currentUserRole === "OWNER" ||
      currentUserRole === "MANAGER" ||
      currentUserRole === "TEAM_LEAD");

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "OWNER":
        return "default";
      case "MANAGER":
        return "secondary";
      case "TEAM_LEAD":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoadingDetails) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-h-[80vh] overflow-hidden sm:max-w-[800px]">
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Loading member details...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (detailsError) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              Failed to load member details: {detailsError.message}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[85vh] flex-col overflow-hidden sm:max-w-[900px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Member Details: {memberName}
          </DialogTitle>
          <DialogDescription>
            View member information and manage notes
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Details
            </TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Notes
              {canCreateNotes && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  Manage
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden">
            <TabsContent
              value="details"
              className="mt-4 h-full overflow-y-auto"
            >
              <div className="space-y-6">
                {/* Basic Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Basic Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Name:</span>
                          <span>{memberDetails?.name || "Not provided"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Username:</span>
                          <span>
                            {memberDetails?.username || "Not provided"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Email:</span>
                          <span>
                            {memberDetails?.email ||
                              memberEmail ||
                              "Not provided"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Joined:</span>
                          <span>
                            {memberDetails?.createdAt
                              ? formatDate(memberDetails.createdAt)
                              : "Unknown"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Team Memberships */}
                {memberDetails?.teamMemberships &&
                  memberDetails.teamMemberships.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          Team Memberships
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {memberDetails.teamMemberships.map(
                            (membership: {
                              id: string;
                              team: { name: string };
                              role: string;
                            }) => (
                              <div
                                key={membership.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <div className="flex items-center gap-2">
                                  <Users className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {membership.team.name}
                                  </span>
                                </div>
                                <Badge
                                  variant={getRoleBadgeVariant(membership.role)}
                                >
                                  {membership.role.replace("_", " ")}
                                </Badge>
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                {/* Organization Memberships */}
                {memberDetails?.organizationMemberships &&
                  memberDetails.organizationMemberships.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Building2 className="h-5 w-5" />
                          Organization Memberships
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {memberDetails.organizationMemberships.map(
                            (membership: {
                              id: string;
                              organization: { name: string };
                              role: string;
                            }) => (
                              <div
                                key={membership.id}
                                className="flex items-center justify-between rounded-lg border p-3"
                              >
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-muted-foreground" />
                                  <span className="font-medium">
                                    {membership.organization.name}
                                  </span>
                                </div>
                                <Badge
                                  variant={getRoleBadgeVariant(membership.role)}
                                >
                                  {membership.role.replace("_", " ")}
                                </Badge>
                              </div>
                            ),
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-4 h-full overflow-hidden">
              <div className="h-full overflow-y-auto">
                <NotesList
                  teamId={teamId}
                  organizationId={organizationId}
                  subjectId={memberId}
                  title={`Notes about ${memberName}`}
                  showCreateButton={canCreateNotes}
                  canCreateNotes={canCreateNotes}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end border-t pt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
