import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  inviteUserToTeam,
  checkAndUpdateExpiredInvites,
  getValidInvites,
  cancelTeamInvite,
} from "@/app/(app)/manage-workspace/actions";

export const teamInvitesRouter = createTRPCRouter({
  // Get all invitations for a team
  getTeamInvites: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { teamId } = input;

      // Get the user ID from the session
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

      // Check if the user has permission to view invitations for this team
      const team = await ctx.db.team.findFirst({
        where: { id: teamId },
        include: { members: true },
      });

      if (!team) {
        throw new Error("Team not found");
      }

      // Check if user is team owner or has manager role
      const isOwner = team.ownerId === user.id;
      const isManager = team.members.some(
        (member) => member.userId === user.id && member.role === "MANAGER",
      );

      if (!isOwner && !isManager) {
        throw new Error(
          "You don't have permission to view invitations for this team",
        );
      }

      // First, check and update any expired invitations
      await checkAndUpdateExpiredInvites();

      // Fetch all invitations for the team
      const allInvites = await ctx.db.teamInvite.findMany({
        where: { teamId },
        orderBy: { createdAt: "desc" },
        include: {
          inviter: {
            select: {
              name: true,
              email: true,
              username: true,
            },
          },
        },
      });

      return allInvites.map((invite) => ({
        id: invite.id,
        email: invite.email,
        status: invite.status,
        createdAt: invite.createdAt,
        expiry: invite.expiry,
        isExpired: invite.expiry < new Date(),
        inviter: invite.inviter,
      }));
    }),

  // Create a new team invitation
  createInvitation: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        email: z.string().email(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { teamId, email } = input;

      // Get the user ID from the session
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

      // Check if the user has permission to invite to this team
      const team = await ctx.db.team.findFirst({
        where: { id: teamId },
        include: { members: true },
      });

      if (!team) {
        throw new Error("Team not found");
      }

      // Check if user is team owner or has manager role
      const isOwner = team.ownerId === user.id;
      const isManager = team.members.some(
        (member) => member.userId === user.id && member.role === "MANAGER",
      );

      if (!isOwner && !isManager) {
        throw new Error(
          "You don't have permission to invite members to this team",
        );
      }

      // Send the invitation
      const result = await inviteUserToTeam(teamId, email, user.id);

      if (!result.success) {
        throw new Error(result.message);
      }

      return { success: true };
    }),

  // Cancel a team invitation
  cancelInvitation: protectedProcedure
    .input(
      z.object({
        inviteId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { inviteId } = input;

      // Get the user ID from the session
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

      const result = await cancelTeamInvite(inviteId, user.id);

      if (!result.success) {
        throw new Error(result.message);
      }

      return { success: true };
    }),

  // Check and update expired invitations
  checkExpiredInvites: protectedProcedure.mutation(async () => {
    const expiredCount = await checkAndUpdateExpiredInvites();
    return { expiredCount };
  }),

  // Get valid (non-expired) invitations for a team
  getValidInvites: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .query(async ({ input }) => {
      const { teamId } = input;
      return await getValidInvites(teamId);
    }),
});
