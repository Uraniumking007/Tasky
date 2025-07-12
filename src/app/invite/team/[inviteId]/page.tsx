import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, User, Calendar, Building2 } from "lucide-react";
import { db } from "@/server/db";
import { AcceptTeamInviteButton, DeclineTeamInviteButton } from "./client";

interface TeamInvitation {
  id: string;
  email: string;
  teamName: string;
  organizationName?: string;
  inviterName: string;
  expiry: string;
}

export default async function TeamInvitePage({
  params,
}: {
  params: { inviteId: string };
}) {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect(
      `/auth/login?callbackUrl=${encodeURIComponent(`/invite/team/${params.inviteId}`)}`,
    );
  }

  // Get the user from database
  const user = await db.users.findFirst({
    where: {
      OR: [{ email: session.user.email }, { username: session.user.username }],
    },
  });

  if (!user) {
    redirect("/auth/login");
  }

  // Get the invitation
  let invitation: TeamInvitation | null = null;
  let error: string | null = null;

  try {
    const invitationData = await db.teamInvite.findUnique({
      where: { id: params.inviteId },
      include: {
        team: {
          include: {
            organization: true,
          },
        },
        inviter: {
          select: {
            name: true,
            username: true,
          },
        },
      },
    });

    if (!invitationData) {
      error = "Invitation not found";
    } else if (invitationData.expiry < new Date()) {
      error = "This invitation has expired";
    } else if (invitationData.status !== "pending") {
      error = `This invitation has been ${invitationData.status}`;
    } else if (invitationData.email !== user.email) {
      error =
        "Email mismatch. This invitation was sent to a different email address.";
    } else {
      invitation = {
        id: invitationData.id,
        email: invitationData.email,
        teamName: invitationData.team.name,
        organizationName: invitationData.team.organization?.name,
        inviterName:
          invitationData.inviter.name ||
          invitationData.inviter.username ||
          "Unknown User",
        expiry: invitationData.expiry.toISOString(),
      };
    }
  } catch (err) {
    error = "Failed to load invitation";
  }

  const expiryDate = invitation ? new Date(invitation.expiry) : new Date();
  const isExpired = expiryDate < new Date();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Users className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Team Invitation</CardTitle>
          <CardDescription>
            You&apos;ve been invited to join a team on Tasky
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error ? (
            <div className="space-y-4 text-center">
              <Badge variant="destructive" className="text-sm">
                Error
              </Badge>
              <p className="text-muted-foreground">{error}</p>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
              >
                Go Home
              </button>
            </div>
          ) : invitation ? (
            <>
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{invitation.teamName}</p>
                    <p className="text-sm text-muted-foreground">Team</p>
                  </div>
                </div>

                {invitation.organizationName && (
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <Building2 className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">
                        {invitation.organizationName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Organization
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <User className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{invitation.inviterName}</p>
                    <p className="text-sm text-muted-foreground">Invited by</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">
                      {expiryDate.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    <p className="text-sm text-muted-foreground">Expires on</p>
                  </div>
                </div>
              </div>

              {isExpired ? (
                <div className="space-y-4 text-center">
                  <Badge variant="destructive" className="text-sm">
                    Expired
                  </Badge>
                  <p className="text-muted-foreground">
                    This invitation has expired. Please contact the team owner
                    for a new invitation.
                  </p>
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                  >
                    Go Home
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <AcceptTeamInviteButton
                    inviteId={params.inviteId}
                    userId={user.id}
                  />
                  <DeclineTeamInviteButton
                    inviteId={params.inviteId}
                    userId={user.id}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="space-y-4 text-center">
              <Badge variant="destructive" className="text-sm">
                Loading Error
              </Badge>
              <p className="text-muted-foreground">
                Failed to load invitation details
              </p>
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
              >
                Go Home
              </button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
