import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

// Helper function to get user from session
async function getUserFromSession(ctx: any) {
  const session = ctx.session;
  if (!session?.user?.email && !session?.user?.username) {
    throw new Error("No user session found");
  }

  const user = await ctx.db.users.findFirst({
    where: {
      OR: [{ email: session.user.email }, { username: session.user.username }],
    },
  });

  if (!user) {
    throw new Error("User not found in database");
  }

  return user;
}

export const workspaceRouter = createTRPCRouter({
  // Get workspace data (organizations and teams filtered by user permissions)
  getWorkspaceData: protectedProcedure.query(async ({ ctx }) => {
    // Get user from database
    const user = await getUserFromSession(ctx);
    const userId = user.id;

    // Fetch organizations where user is OWNER
    const ownedOrganizations = await ctx.db.organization.findMany({
      where: { ownerId: userId },
      include: {
        members: { include: { user: true } },
        teams: {
          include: {
            members: { include: { user: true } },
          },
        },
      },
    });

    // Fetch organizations where user is a MEMBER (not owner)
    const memberOrganizations = await ctx.db.organizationMember.findMany({
      where: {
        userId: userId,
        role: { not: "OWNER" }, // Exclude organizations where user is owner
      },
      include: {
        organization: {
          include: {
            members: { include: { user: true } },
            teams: {
              include: {
                members: { include: { user: true } },
              },
            },
          },
        },
      },
    });

    // Get user's team memberships for filtering
    const userTeamMemberships = await ctx.db.teamMember.findMany({
      where: { userId: userId },
      select: { teamId: true },
    });
    const userTeamIds = new Set(
      userTeamMemberships.map((membership) => membership.teamId),
    );

    // Combine and format the organizations
    const allOrganizations = [
      ...ownedOrganizations.map((org) => ({
        id: org.id,
        name: org.name,
        userRole: "OWNER" as const,
        teams: org.teams.map((team) => ({
          id: team.id,
          name: team.name,
          organizationId: team.organizationId,
          members: team.members,
        })),
        members: org.members,
      })),
      ...memberOrganizations.map((membership) => {
        const userRole = membership.role as "MANAGER" | "MEMBER";

        // Filter teams based on user role
        let visibleTeams;
        if (userRole === "MANAGER") {
          // Managers can see all teams in the organization
          visibleTeams = membership.organization.teams;
        } else {
          // Regular members can only see teams they belong to
          visibleTeams = membership.organization.teams.filter((team) =>
            userTeamIds.has(team.id),
          );
        }

        return {
          id: membership.organization.id,
          name: membership.organization.name,
          userRole: userRole,
          teams: visibleTeams.map((team) => ({
            id: team.id,
            name: team.name,
            organizationId: team.organizationId,
            members: team.members,
          })),
          members: membership.organization.members,
        };
      }),
    ];

    return allOrganizations;
  }),
});
