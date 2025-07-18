import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { canUserAccessTeamChat } from "@/lib/permissions";

async function getUserFromSession(ctx: any) {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Must be logged in",
    });
  }

  const user = await ctx.db.users.findFirst({
    where: {
      OR: [
        { email: ctx.session.user.email },
        { username: ctx.session.user.username },
      ],
    },
  });

  if (!user) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User not found",
    });
  }

  return user;
}

export const chatRouter = createTRPCRouter({
  // Get messages for a team
  getTeamMessages: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(), // For pagination
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);

      // Verify user can access team chat (includes org owners and managers)
      const accessCheck = await canUserAccessTeamChat(user.id, input.teamId);

      if (!accessCheck.canAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to view messages for this team",
        });
      }

      const messages = await ctx.db.message.findMany({
        where: {
          teamId: input.teamId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: input.limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
      });

      let nextCursor: string | undefined = undefined;
      if (messages.length > input.limit) {
        const nextItem = messages.pop();
        nextCursor = nextItem!.id;
      }

      return {
        messages: messages.reverse(), // Show oldest first
        nextCursor,
      };
    }),

  // Send a message (for non-real-time fallback)
  sendMessage: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).max(1000),
        teamId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);

      // Verify user can access team chat (includes org owners and managers)
      const accessCheck = await canUserAccessTeamChat(user.id, input.teamId);

      if (!accessCheck.canAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to send messages to this team",
        });
      }

      const message = await ctx.db.message.create({
        data: {
          content: input.content,
          authorId: user.id,
          teamId: input.teamId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        message,
      };
    }),

  // Edit a message
  editMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
        content: z.string().min(1).max(1000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);

      const message = await ctx.db.message.findFirst({
        where: {
          id: input.messageId,
          authorId: user.id, // Only author can edit
        },
      });

      if (!message) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Message not found or not authorized to edit",
        });
      }

      const updatedMessage = await ctx.db.message.update({
        where: { id: input.messageId },
        data: {
          content: input.content,
          isEdited: true,
          editedAt: new Date(),
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
        },
      });

      return {
        success: true,
        message: updatedMessage,
      };
    }),

  // Delete a message
  deleteMessage: protectedProcedure
    .input(
      z.object({
        messageId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);

      const message = await ctx.db.message.findFirst({
        where: {
          id: input.messageId,
          authorId: user.id, // Only author can delete
        },
      });

      if (!message) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Message not found or not authorized to delete",
        });
      }

      await ctx.db.message.delete({
        where: { id: input.messageId },
      });

      return {
        success: true,
        messageId: input.messageId,
      };
    }),

  // Get team members for online status (optional feature)
  getTeamMembers: protectedProcedure
    .input(
      z.object({
        teamId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);

      // Verify user can access team chat (includes org owners and managers)
      const accessCheck = await canUserAccessTeamChat(user.id, input.teamId);

      if (!accessCheck.canAccess) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to view team members",
        });
      }

      // Get team details to find organization
      const team = await ctx.db.team.findUnique({
        where: { id: input.teamId },
        select: { 
          ownerId: true, 
          organizationId: true,
        },
      });

      if (!team) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Team not found",
        });
      }

      // Get direct team members
      const teamMembers = await ctx.db.teamMember.findMany({
        where: {
          teamId: input.teamId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          },
        },
      });

      let allMembers: Array<{
        id: string;
        name: string | null;
        username: string | null;
        email: string | null;
        role: any;
        accessType: "team_member" | "team_owner" | "org_owner" | "org_manager";
      }> = teamMembers.map((member) => ({
        id: member.user.id,
        name: member.user.name,
        username: member.user.username,
        email: member.user.email,
        role: member.role,
        accessType: "team_member" as const,
      }));

      // Add team owner if not already in members
      if (!allMembers.find(m => m.id === team.ownerId)) {
        const teamOwner = await ctx.db.users.findUnique({
          where: { id: team.ownerId },
          select: {
            id: true,
            name: true,
            username: true,
            email: true,
          },
        });
        
        if (teamOwner) {
          allMembers.push({
            id: teamOwner.id,
            name: teamOwner.name,
            username: teamOwner.username,
            email: teamOwner.email,
            role: "OWNER" as const,
            accessType: "team_owner" as const,
          });
        }
      }

      // If team belongs to an organization, add org owners and managers
      if (team.organizationId) {
        const orgOwnerAndManagers = await ctx.db.organizationMember.findMany({
          where: {
            organizationId: team.organizationId,
            role: { in: ["OWNER", "MANAGER"] },
            // Exclude users already in the team
            userId: { notIn: allMembers.map(m => m.id) },
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                email: true,
              },
            },
          },
        });

        // Add org owner (if different from team owner)
        const organization = await ctx.db.organization.findUnique({
          where: { id: team.organizationId },
          select: { ownerId: true },
        });

        if (organization && !allMembers.find(m => m.id === organization.ownerId)) {
          const orgOwner = await ctx.db.users.findUnique({
            where: { id: organization.ownerId },
            select: {
              id: true,
              name: true,
              username: true,
              email: true,
            },
          });
          
          if (orgOwner) {
            allMembers.push({
              id: orgOwner.id,
              name: orgOwner.name,
              username: orgOwner.username,
              email: orgOwner.email,
              role: "OWNER" as const,
              accessType: "org_owner" as const,
            });
          }
        }

        // Add org managers
        const orgManagersToAdd = orgOwnerAndManagers.map((member) => ({
          id: member.user.id,
          name: member.user.name,
          username: member.user.username,
          email: member.user.email,
          role: member.role,
          accessType: "org_manager" as const,
        }));

        allMembers = [...allMembers, ...orgManagersToAdd];
      }

      return allMembers;
    }),
});
