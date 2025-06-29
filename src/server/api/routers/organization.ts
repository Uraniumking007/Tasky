import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  getUserPermissions,
  getUserRoleInOrganization,
  getRolePermissions,
  canUserManageTeam,
} from "@/lib/permissions";

// Helper function to get user from session
async function getUserFromSession(ctx: any) {
  const user = await ctx.db.users.findFirst({
    where: {
      OR: [
        { email: ctx.session.user.email },
        { username: ctx.session.user.username },
      ],
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export const organizationRouter = createTRPCRouter({
  // Get organization details with members and teams
  getOrganization: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { organizationId } = input;

      // Get user from database
      const user = await getUserFromSession(ctx);

      // Check user permissions
      const permissions = await getUserPermissions(user.id);
      const userRole = getUserRoleInOrganization(permissions, organizationId);

      if (!userRole) {
        throw new Error("No access to organization");
      }

      const rolePermissions = getRolePermissions(userRole);

      // Get organization with members and teams
      const organization = await ctx.db.organization.findUnique({
        where: { id: organizationId },
        include: {
          owner: {
            select: {
              name: true,
              email: true,
              username: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  username: true,
                },
              },
            },
            orderBy: {
              user: {
                name: "asc",
              },
            },
          },
          teams: {
            include: {
              members: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      username: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              name: "asc",
            },
          },
        },
      });

      if (!organization) {
        throw new Error("Organization not found");
      }

      // Filter teams based on user's role and team privacy
      const visibleTeams = rolePermissions.canViewAllTeamsInOrg
        ? organization.teams.filter((team: any) => {
            // If team is private, user must be a member to see it
            if (team.isPrivate) {
              return team.members.some(
                (member: any) => member.userId === user.id,
              );
            }
            return true; // Public teams are visible to all org members
          })
        : organization.teams.filter((team: any) =>
            team.members.some((member: any) => member.userId === user.id),
          );

      return {
        organization: {
          ...organization,
          teams: visibleTeams,
        },
        userRole,
        permissions: rolePermissions,
      };
    }),

  // Get organization invites
  getInvites: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { organizationId } = input;

      // Get user from database
      const user = await getUserFromSession(ctx);

      // Check permissions
      const permissions = await getUserPermissions(user.id);
      const userRole = getUserRoleInOrganization(permissions, organizationId);

      if (!userRole) {
        throw new Error("No access to organization");
      }

      const rolePermissions = getRolePermissions(userRole);
      if (!rolePermissions.canInviteOrganizationMembers) {
        throw new Error("No permission to view invites");
      }

      // Get all invites for this organization
      const invites = await ctx.db.organizationInvite.findMany({
        where: { organizationId },
        include: {
          inviter: {
            select: {
              name: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return invites.map((invite) => ({
        id: invite.id,
        email: invite.email,
        status: invite.status,
        createdAt: invite.createdAt,
        expiry: invite.expiry,
        inviterName:
          invite.inviter.name ||
          invite.inviter.username ||
          invite.inviter.email,
      }));
    }),

  // Get available organization members for team
  getAvailableMembers: protectedProcedure
    .input(z.object({ organizationId: z.string(), teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { organizationId, teamId } = input;

      // Get user from database
      const user = await getUserFromSession(ctx);

      // Check if user can manage the team
      const managementCheck = await canUserManageTeam(user.id, teamId);
      if (!managementCheck.canManage) {
        throw new Error("No permission to manage team members");
      }

      // Get organization members and current team members
      const [organization, team] = await Promise.all([
        ctx.db.organization.findUnique({
          where: { id: organizationId },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                  },
                },
              },
            },
          },
        }),
        ctx.db.team.findUnique({
          where: { id: teamId },
          include: {
            members: {
              select: {
                userId: true,
              },
            },
          },
        }),
      ]);

      if (!organization || !team) {
        throw new Error("Organization or team not found");
      }

      // Filter out users who are already team members
      const currentTeamMemberIds = new Set(team.members.map((m) => m.userId));
      const availableMembers = organization.members
        .filter((member) => !currentTeamMemberIds.has(member.userId))
        .map((member) => ({
          id: member.userId,
          name: member.user.name || member.user.username || "Unknown User",
          email: member.user.email,
          role: member.role,
        }));

      return availableMembers;
    }),

  // Invite organization member
  inviteMember: protectedProcedure
    .input(z.object({ organizationId: z.string(), email: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId, email } = input;

      // Import and use the server action
      const { inviteOrganizationMember } = await import(
        "@/app/(app)/organization/[organizationId]/actions"
      );
      const result = await inviteOrganizationMember(organizationId, email);

      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    }),

  // Add team member
  addTeamMember: protectedProcedure
    .input(z.object({ teamId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { teamId, userId } = input;

      // Import and use the server action
      const { addTeamMember } = await import(
        "@/app/(app)/organization/[organizationId]/actions"
      );
      const result = await addTeamMember(teamId, userId);

      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    }),

  // Invite to organization and team
  inviteToTeam: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        teamId: z.string(),
        email: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { organizationId, teamId, email } = input;

      // Import and use the server action
      const { inviteToOrganizationAndTeam } = await import(
        "@/app/(app)/organization/[organizationId]/actions"
      );
      const result = await inviteToOrganizationAndTeam(
        organizationId,
        teamId,
        email,
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    }),

  // Remove organization member
  removeMember: protectedProcedure
    .input(z.object({ organizationId: z.string(), memberUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId, memberUserId } = input;

      // Import and use the server action
      const { removeOrganizationMember } = await import(
        "@/app/(app)/organization/[organizationId]/actions"
      );
      const result = await removeOrganizationMember(
        organizationId,
        memberUserId,
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    }),

  // Create team in organization
  createTeam: protectedProcedure
    .input(z.object({ organizationId: z.string(), teamName: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId, teamName } = input;

      // Import and use the server action
      const { createTeamInOrganization } = await import(
        "@/app/(app)/organization/[organizationId]/actions"
      );
      const result = await createTeamInOrganization(organizationId, teamName);

      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    }),

  // Cancel organization invite
  cancelInvite: protectedProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { inviteId } = input;

      // Import and use the server action
      const { cancelOrganizationInvite } = await import(
        "@/app/(app)/organization/[organizationId]/actions"
      );
      const result = await cancelOrganizationInvite(inviteId);

      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    }),

  // Resend organization invite
  resendInvite: protectedProcedure
    .input(z.object({ inviteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { inviteId } = input;

      // Import and use the server action
      const { resendOrganizationInvite } = await import(
        "@/app/(app)/organization/[organizationId]/actions"
      );
      const result = await resendOrganizationInvite(inviteId);

      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    }),

  // Edit organization
  editOrganization: protectedProcedure
    .input(z.object({ organizationId: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { organizationId, name } = input;
      const user = await getUserFromSession(ctx);

      // Import and use the server action
      const { editOrganization } = await import(
        "@/app/(app)/manage-workspace/actions"
      );
      const result = await editOrganization(organizationId, name, user.id);

      if (!result.success) {
        throw new Error(result.message);
      }

      return result;
    }),
});
