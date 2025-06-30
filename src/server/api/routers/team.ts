import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { canUserManageTeam } from "@/lib/permissions";

// Helper function to get user from session
async function getUserFromSession(ctx: { session: any; db: any }) {
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

export const teamRouter = createTRPCRouter({
  // Get team details
  getTeam: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;

      // Get user from database
      const user = await getUserFromSession(ctx);

      // Check if user can access the team
      const managementCheck = await canUserManageTeam(user.id, teamId);

      // For access, we need either management rights or to check team membership separately
      let hasAccess = managementCheck.canManage;

      if (!hasAccess) {
        // Check if user is a team member
        const teamMember = await ctx.db.teamMember.findFirst({
          where: {
            userId: user.id,
            teamId: teamId,
          },
        });
        hasAccess = !!teamMember;
      }

      if (!hasAccess) {
        throw new Error("No access to team");
      }

      // Get team with members and organization
      const team = await ctx.db.team.findUnique({
        where: { id: teamId },
        select: {
          id: true,
          name: true,
          isPrivate: true,
          allowAutoJoin: true,
          createdAt: true,
          updatedAt: true,
          ownerId: true,
          organizationId: true,
          organization: {
            select: {
              id: true,
              name: true,
            },
          },
          members: {
            select: {
              id: true,
              userId: true,
              role: true,
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
        },
      });

      if (!team) {
        throw new Error("Team not found");
      }

      return {
        team,
        canManage: managementCheck.canManage,
        managementReason: managementCheck.reason,
        userRole: managementCheck.role,
      };
    }),

  // Edit team
  editTeam: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        name: z.string().min(1, "Team name cannot be empty").optional(),
        isPrivate: z.boolean().optional(),
        allowAutoJoin: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { teamId, name, isPrivate, allowAutoJoin } = input;

      // Get user from database
      const user = await getUserFromSession(ctx);

      // Check if user can manage this team (either through team membership or organization)
      const managementCheck = await canUserManageTeam(user.id, teamId);
      if (!managementCheck.canManage) {
        throw new Error("No permission to edit team");
      }

      // Get team to check organization
      const team = await ctx.db.team.findUnique({
        where: { id: teamId },
        select: { organizationId: true },
      });

      if (!team) {
        throw new Error("Team not found");
      }

      // Build update data object with only provided fields
      const updateData: {
        name?: string;
        isPrivate?: boolean;
        allowAutoJoin?: boolean;
      } = {};
      if (name !== undefined) updateData.name = name;
      if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
      if (allowAutoJoin !== undefined) updateData.allowAutoJoin = allowAutoJoin;

      // Update team
      const updatedTeam = await ctx.db.team.update({
        where: { id: teamId },
        data: updateData,
      });

      return {
        success: true,
        message: "Team updated successfully",
        team: updatedTeam,
      };
    }),

  // Delete team
  deleteTeam: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { teamId } = input;

      // Get user from database
      const user = await getUserFromSession(ctx);

      // Check if user can manage this team
      const managementCheck = await canUserManageTeam(user.id, teamId);
      if (!managementCheck.canManage || managementCheck.role !== "OWNER") {
        throw new Error("Only team owners can delete teams");
      }

      // Get team to check organization
      const team = await ctx.db.team.findUnique({
        where: { id: teamId },
        select: { organizationId: true, name: true },
      });

      if (!team) {
        throw new Error("Team not found");
      }

      // Delete team (this will cascade delete team members and tasks)
      await ctx.db.team.delete({
        where: { id: teamId },
      });

      return {
        success: true,
        message: "Team deleted successfully",
        redirectTo: team.organizationId
          ? `/organization/${team.organizationId}`
          : "/home",
      };
    }),

  // Remove team member
  removeMember: protectedProcedure
    .input(z.object({ teamId: z.string(), userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { teamId, userId } = input;

      // Get user from database
      const user = await getUserFromSession(ctx);

      // Check if user can manage this team
      const managementCheck = await canUserManageTeam(user.id, teamId);
      if (!managementCheck.canManage) {
        throw new Error("No permission to remove team members");
      }

      // Check if trying to remove themselves
      if (user.id === userId) {
        throw new Error("Cannot remove yourself from the team");
      }

      // Remove team member
      await ctx.db.teamMember.delete({
        where: {
          teamId_userId: {
            teamId,
            userId,
          },
        },
      });

      return {
        success: true,
        message: "Member removed from team successfully",
      };
    }),

  // Invite team member
  inviteMember: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        email: z.string().email("Invalid email format"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { teamId, email } = input;

      // Get user from database
      const user = await getUserFromSession(ctx);

      // Check if user can manage this team
      const managementCheck = await canUserManageTeam(user.id, teamId);
      if (!managementCheck.canManage) {
        throw new Error("No permission to invite team members");
      }

      // Get team with organization info
      const team = await ctx.db.team.findUnique({
        where: { id: teamId },
        include: { organization: true },
      });

      if (!team) {
        throw new Error("Team not found");
      }

      // Check if user is already in organization (if team belongs to one)
      let targetUser = null;
      if (team.organizationId) {
        targetUser = await ctx.db.users.findFirst({
          where: { email },
        });

        if (targetUser) {
          const orgMembership = await ctx.db.organizationMember.findFirst({
            where: {
              userId: targetUser.id,
              organizationId: team.organizationId,
            },
          });

          if (!orgMembership) {
            throw new Error("User must be a member of the organization first");
          }

          // Check if already a team member
          const teamMembership = await ctx.db.teamMember.findFirst({
            where: {
              userId: targetUser.id,
              teamId,
            },
          });

          if (teamMembership) {
            throw new Error("User is already a member of this team");
          }

          // Add user to team
          await ctx.db.teamMember.create({
            data: {
              userId: targetUser.id,
              teamId,
              role: "MEMBER",
            },
          });

          return { success: true, message: "User added to team successfully" };
        }
      }

      // If user doesn't exist or team doesn't have organization, create an invite
      // This would require implementing the team invite system
      throw new Error(
        "Team invitation system not implemented for external users",
      );
    }),
});
