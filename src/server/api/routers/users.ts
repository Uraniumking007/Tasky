import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { generateSecureToken } from "@/lib/crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import type { Session } from "next-auth";
import type { PrismaClient } from "@prisma/client";

// Helper function to get user from session
async function getUserFromSession(ctx: { session: Session; db: PrismaClient }) {
  if (!ctx.session.user.email && !ctx.session.user.username) {
    throw new Error("No email or username in session");
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
    throw new Error("User not found");
  }

  return user;
}

export const usersRouter = createTRPCRouter({
  // Get current user data
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserFromSession(ctx);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
    };
  }),
  // Get member details with their memberships
  getMemberDetails: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        teamId: z.string().optional(), // Add team context for permission checking
        organizationId: z.string().optional(), // Add organization context for permission checking
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const { userId, teamId, organizationId } = input;

        // Get current user from database
        const currentUser = await getUserFromSession(ctx);
        console.log("Current user from session:", {
          id: currentUser.id,
          email: currentUser.email,
          username: currentUser.username,
        });
        console.log("Session info:", {
          sessionEmail: ctx.session.user.email,
          sessionUsername: ctx.session.user.username,
        });

        // Debug: Check what memberships this user actually has
        const debugUserMemberships = await ctx.db.organizationMember.findMany({
          where: { userId: currentUser.id },
          include: { organization: { select: { name: true } } },
        });
        console.log(
          "DEBUG: User's actual organization memberships:",
          debugUserMemberships,
        );

        // Get the target user details
        const targetUser = await ctx.db.users.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            createdAt: true,
            teamMemberships: {
              select: {
                id: true,
                role: true,
                team: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              orderBy: {
                team: {
                  name: "asc",
                },
              },
            },
            organizationMemberships: {
              select: {
                id: true,
                role: true,
                organization: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              orderBy: {
                organization: {
                  name: "asc",
                },
              },
            },
          },
        });

        if (!targetUser) {
          throw new Error("User not found");
        }

        // Check if current user has permission to view this member's details
        const canViewMember = await checkIfCanViewMember(
          ctx.db,
          currentUser.id,
          targetUser.id,
          teamId, // Pass team context
          organizationId, // Pass organization context
        );
        const hasPermission =
          currentUser.id === targetUser.id || // User viewing their own details
          canViewMember;

        console.log("Member details permission check:", {
          currentUserId: currentUser.id,
          targetUserId: targetUser.id,
          isSameUser: currentUser.id === targetUser.id,
          canViewMember,
          hasPermission,
        });

        if (!hasPermission) {
          throw new Error("No permission to view member details");
        }

        return {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          username: targetUser.username,
          createdAt: targetUser.createdAt.toISOString(),
          teamMemberships: targetUser.teamMemberships,
          organizationMemberships: targetUser.organizationMemberships,
        };
      } catch (error) {
        console.error("Error in getMemberDetails:", error);
        throw new Error(
          error instanceof Error
            ? error.message
            : "Failed to get member details",
        );
      }
    }),

  // Switch active team
  switchActiveTeam: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { teamId } = input;
      const user = await getUserFromSession(ctx);

      // Check if user has access to this team
      const teamMembership = await ctx.db.teamMember.findFirst({
        where: {
          userId: user.id,
          teamId: teamId,
        },
      });

      // Also check if user owns this team
      const ownedTeam = await ctx.db.team.findFirst({
        where: {
          id: teamId,
          ownerId: user.id,
        },
      });

      if (!teamMembership && !ownedTeam) {
        throw new Error("No access to this team");
      }

      // Update user's active team
      await ctx.db.users.update({
        where: { id: user.id },
        data: { active_team: teamId },
      });

      return {
        success: true,
        message: "Active team switched successfully",
        teamId,
      };
    }),

  // Get user's teams for team switching
  getUserTeams: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserFromSession(ctx);

    // Get teams where user is a member
    const teamMemberships = await ctx.db.teamMember.findMany({
      where: { userId: user.id },
      include: {
        team: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Get teams owned by user
    const ownedTeams = await ctx.db.team.findMany({
      where: { ownerId: user.id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const allTeams = [
      ...teamMemberships.map((membership) => ({
        id: membership.team.id,
        name: membership.team.name,
        role: membership.role,
        organization: membership.team.organization,
        isActive: user.active_team === membership.team.id,
      })),
      ...ownedTeams.map((team) => ({
        id: team.id,
        name: team.name,
        role: "OWNER" as const,
        organization: team.organization,
        isActive: user.active_team === team.id,
      })),
    ];

    return allTeams;
  }),

  // Get team members for task assignment
  getTeamMembers: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);
      const { teamId } = input;

      // Check if user has access to this team
      const teamMembership = await ctx.db.teamMember.findFirst({
        where: {
          userId: user.id,
          teamId: teamId,
        },
      });

      const ownedTeam = await ctx.db.team.findFirst({
        where: {
          id: teamId,
          ownerId: user.id,
        },
      });

      if (!teamMembership && !ownedTeam) {
        throw new Error("No access to this team");
      }

      // Get all team members
      const teamMembers = await ctx.db.teamMember.findMany({
        where: { teamId },
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
      });

      return teamMembers.map((member) => ({
        id: member.user.id,
        name: member.user.name || member.user.username || "Unknown User",
        email: member.user.email,
        username: member.user.username,
        role: member.role,
      }));
    }),

  // Forgot password - send reset email
  forgotPassword: publicProcedure
    .input(
      z.object({
        email: z.string().email("Please enter a valid email address"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { email } = input;

      // Find user by email
      const user = await ctx.db.users.findUnique({
        where: { email: email.toLowerCase() },
      });

      // Always return success to prevent email enumeration
      if (!user) {
        return {
          success: true,
          message:
            "If an account with that email exists, a password reset link has been sent.",
        };
      }

      // Generate secure reset token
      const resetToken = generateSecureToken(32);
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Save reset token to database
      await ctx.db.users.update({
        where: { id: user.id },
        data: {
          resetToken,
          resetTokenExpiry,
        },
      });

      // Create reset URL
      const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/reset-password?token=${resetToken}`;

      // Send password reset email
      const emailResult = await sendPasswordResetEmail({
        email: user.email!,
        username: user.username || user.name || "User",
        resetUrl,
        expiryDate: resetTokenExpiry,
      });

      if (!emailResult.success) {
        console.error(
          "Failed to send password reset email:",
          emailResult.error,
        );
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            "Failed to send password reset email. Please try again later.",
        });
      }

      return {
        success: true,
        message:
          "If an account with that email exists, a password reset link has been sent.",
      };
    }),

  // Reset password with token
  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Reset token is required"),
        password: z
          .string()
          .min(8, "Password must be at least 8 characters long"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { token, password } = input;

      // Find user by reset token
      const user = await ctx.db.users.findUnique({
        where: { resetToken: token },
      });

      if (!user) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token.",
        });
      }

      // Check if token has expired
      if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Reset token has expired. Please request a new password reset.",
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update user password and clear reset token
      await ctx.db.users.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return {
        success: true,
        message:
          "Password has been reset successfully. You can now log in with your new password.",
      };
    }),

  // Validate reset token
  validateResetToken: publicProcedure
    .input(
      z.object({
        token: z.string().min(1, "Reset token is required"),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { token } = input;

      const user = await ctx.db.users.findUnique({
        where: { resetToken: token },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          resetTokenExpiry: true,
        },
      });

      if (!user) {
        return {
          valid: false,
          message: "Invalid reset token.",
        };
      }

      if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
        return {
          valid: false,
          message:
            "Reset token has expired. Please request a new password reset.",
        };
      }

      return {
        valid: true,
        user: {
          email: user.email,
          username: user.username,
          name: user.name,
        },
      };
    }),
});

// Helper function to check if current user can view member details
async function checkIfCanViewMember(
  db: PrismaClient,
  currentUserId: string,
  targetUserId: string,
  teamId?: string,
  organizationId?: string,
): Promise<boolean> {
  try {
    // If team context is provided, check if user can manage that specific team
    if (teamId) {
      // Import the permission function we know works
      const { canUserManageTeam } = await import("@/lib/permissions");
      const teamManagement = await canUserManageTeam(currentUserId, teamId);

      if (teamManagement.canManage) {
        // Check if target user is a member of this team
        const targetUserInTeam = await db.teamMember.findFirst({
          where: {
            userId: targetUserId,
            teamId: teamId,
          },
        });

        if (targetUserInTeam) {
          console.log("✅ Permission granted via team management context");
          return true;
        }
      }
    }

    // If organization context is provided, check if user can manage that specific organization
    if (organizationId) {
      console.log("🔍 Checking organization context:", {
        organizationId,
        currentUserId,
        targetUserId,
      });

      // Use the same permission system as the organization router
      const { getUserPermissions, getUserRoleInOrganization } = await import(
        "@/lib/permissions"
      );
      const currentUserPermissions = await getUserPermissions(currentUserId);
      const currentUserOrgRole = getUserRoleInOrganization(
        currentUserPermissions,
        organizationId,
      );

      console.log("Current user org role:", currentUserOrgRole);

      if (currentUserOrgRole) {
        const hasOrgManagementRights =
          currentUserOrgRole === "OWNER" ||
          currentUserOrgRole === "MANAGER" ||
          currentUserOrgRole === "TEAM_LEAD";

        console.log("Org management rights check:", {
          role: currentUserOrgRole,
          hasOrgManagementRights,
        });

        if (hasOrgManagementRights) {
          // Check if target user has any relationship with this organization
          // (either membership or team membership within the org)
          const targetUserPermissions = await getUserPermissions(targetUserId);
          const targetUserOrgRole = getUserRoleInOrganization(
            targetUserPermissions,
            organizationId,
          );

          // Also check if target user is in any teams within this organization
          const targetUserInOrgTeams = targetUserPermissions.userTeams.some(
            (team) => team.organizationId === organizationId,
          );

          console.log("Target user org context:", {
            orgRole: targetUserOrgRole,
            inOrgTeams: targetUserInOrgTeams,
          });

          if (targetUserOrgRole || targetUserInOrgTeams) {
            console.log(
              "✅ Permission granted via organization management context",
            );
            return true;
          }
        }
      } else {
        console.log("❌ Current user has no role in organization");
      }
    }

    // Check if they share any teams where current user is team lead or higher
    const currentUserTeams = await db.teamMember.findMany({
      where: { userId: currentUserId },
      select: { teamId: true, role: true },
    });

    const targetUserTeams = await db.teamMember.findMany({
      where: { userId: targetUserId },
      select: { teamId: true },
    });

    console.log("Team membership check:", {
      currentUserTeams,
      targetUserTeams,
    });

    // Check for shared teams with appropriate permissions
    for (const currentTeam of currentUserTeams) {
      const targetInSameTeam = targetUserTeams.some(
        (targetTeam) => targetTeam.teamId === currentTeam.teamId,
      );

      console.log("Team check:", {
        teamId: currentTeam.teamId,
        currentRole: currentTeam.role,
        targetInSameTeam,
      });

      if (
        targetInSameTeam &&
        (currentTeam.role === "OWNER" ||
          currentTeam.role === "MANAGER" ||
          currentTeam.role === "TEAM_LEAD")
      ) {
        console.log("✅ Permission granted via team");
        return true;
      }
    }

    // Check if they share any organizations where current user is manager or higher
    const currentUserOrgs = await db.organizationMember.findMany({
      where: { userId: currentUserId },
      select: { organizationId: true, role: true },
    });

    const targetUserOrgs = await db.organizationMember.findMany({
      where: { userId: targetUserId },
      select: { organizationId: true },
    });

    console.log("Org membership check:", {
      currentUserOrgs,
      targetUserOrgs,
    });

    // Check for shared organizations with appropriate permissions
    for (const currentOrg of currentUserOrgs) {
      const targetInSameOrg = targetUserOrgs.some(
        (targetOrg) => targetOrg.organizationId === currentOrg.organizationId,
      );

      console.log("Org check:", {
        orgId: currentOrg.organizationId,
        currentRole: currentOrg.role,
        targetInSameOrg,
      });

      if (
        targetInSameOrg &&
        (currentOrg.role === "OWNER" ||
          currentOrg.role === "MANAGER" ||
          currentOrg.role === "TEAM_LEAD")
      ) {
        console.log("✅ Permission granted via org");
        return true;
      }
    }

    console.log("❌ No permission found");
    return false;
  } catch (error) {
    console.error("Error checking member view permissions:", error);
    return false;
  }
}
