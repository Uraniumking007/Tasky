import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
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
