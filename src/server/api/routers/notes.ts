import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { canUserManageTeam } from "@/lib/permissions";
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

// Helper function to check if user can view notes for a member
async function canViewNotesForMember(
  ctx: { db: PrismaClient },
  viewerId: string,
  subjectId: string,
  includePrivate: boolean = false,
  teamId?: string,
  organizationId?: string,
): Promise<boolean> {
  if (viewerId === subjectId) {
    return true; // Can always view own notes
  }

  // If team context is provided, use the same logic as member details
  if (teamId) {
    const teamManagement = await canUserManageTeam(viewerId, teamId);
    if (teamManagement.canManage) {
      // Check if subject user is a member of this team
      const subjectInTeam = await ctx.db.teamMember.findFirst({
        where: {
          userId: subjectId,
          teamId: teamId,
        },
      });

      if (subjectInTeam) {
        console.log("✅ Notes permission granted via team management context");
        return true;
      }
    }
  }

  // If organization context is provided, use the same logic as member details
  if (organizationId) {
    console.log("🔍 Notes: Checking organization context:", {
      organizationId,
      viewerId,
      subjectId,
    });

    // Use the same permission system as the organization router
    const { getUserPermissions, getUserRoleInOrganization } = await import(
      "@/lib/permissions"
    );
    const viewerPermissions = await getUserPermissions(viewerId);
    const viewerOrgRole = getUserRoleInOrganization(
      viewerPermissions,
      organizationId,
    );

    console.log("Notes: Viewer org role:", viewerOrgRole);

    if (viewerOrgRole) {
      const hasOrgManagementRights =
        viewerOrgRole === "OWNER" ||
        viewerOrgRole === "MANAGER" ||
        viewerOrgRole === "TEAM_LEAD";

      console.log("Notes: Org management rights check:", {
        role: viewerOrgRole,
        hasOrgManagementRights,
      });

      if (hasOrgManagementRights) {
        // Check if subject user has any relationship with this organization
        const subjectPermissions = await getUserPermissions(subjectId);
        const subjectOrgRole = getUserRoleInOrganization(
          subjectPermissions,
          organizationId,
        );

        // Also check if subject user is in any teams within this organization
        const subjectInOrgTeams = subjectPermissions.userTeams.some(
          (team) => team.organizationId === organizationId,
        );

        console.log("Notes: Subject user org context:", {
          orgRole: subjectOrgRole,
          inOrgTeams: subjectInOrgTeams,
        });

        if (subjectOrgRole || subjectInOrgTeams) {
          console.log(
            "✅ Notes permission granted via organization management context",
          );
          return true;
        }
      }
    } else {
      console.log("❌ Notes: Viewer has no role in organization");
    }
  }

  // For public notes, check if they share teams or organizations
  if (!includePrivate) {
    const shareConnection = await checkSharedConnection(
      ctx.db,
      viewerId,
      subjectId,
    );
    return shareConnection;
  }

  // For private notes, need superior role
  const isSuperior = await checkSuperiorRole(ctx.db, viewerId, subjectId);
  return isSuperior;
}

// Helper function to check if user can manage notes for a team member
async function canManageNotesForMember(
  ctx: { db: PrismaClient },
  managerId: string,
  subjectId: string,
  teamId?: string,
  organizationId?: string,
): Promise<boolean> {
  if (managerId === subjectId) {
    return true; // Can always manage own notes
  }

  // If team context is provided, use the same logic as member details
  if (teamId) {
    const teamManagement = await canUserManageTeam(managerId, teamId);
    if (teamManagement.canManage) {
      // Check if subject user is a member of this team
      const subjectInTeam = await ctx.db.teamMember.findFirst({
        where: {
          userId: subjectId,
          teamId: teamId,
        },
      });

      if (subjectInTeam) {
        console.log("✅ Notes management permission granted via team context");
        return true;
      }
    }
  }

  // If organization context is provided, use the same logic as member details
  if (organizationId) {
    // Use the same permission system as the organization router
    const { getUserPermissions, getUserRoleInOrganization } = await import(
      "@/lib/permissions"
    );
    const managerPermissions = await getUserPermissions(managerId);
    const managerOrgRole = getUserRoleInOrganization(
      managerPermissions,
      organizationId,
    );

    if (managerOrgRole) {
      const hasOrgManagementRights =
        managerOrgRole === "OWNER" ||
        managerOrgRole === "MANAGER" ||
        managerOrgRole === "TEAM_LEAD";

      if (hasOrgManagementRights) {
        // Check if subject user has any relationship with this organization
        const subjectPermissions = await getUserPermissions(subjectId);
        const subjectOrgRole = getUserRoleInOrganization(
          subjectPermissions,
          organizationId,
        );

        // Also check if subject user is in any teams within this organization
        const subjectInOrgTeams = subjectPermissions.userTeams.some(
          (team) => team.organizationId === organizationId,
        );

        if (subjectOrgRole || subjectInOrgTeams) {
          console.log(
            "✅ Notes management permission granted via organization context",
          );
          return true;
        }
      }
    }
  }

  // Check if manager has superior role over subject
  return await checkSuperiorRole(ctx.db, managerId, subjectId);
}

// Helper function to check if users share any teams or organizations
async function checkSharedConnection(
  db: PrismaClient,
  viewerId: string,
  subjectId: string,
): Promise<boolean> {
  try {
    // Check shared teams
    const viewerTeams = await db.teamMember.findMany({
      where: { userId: viewerId },
      select: { teamId: true },
    });

    const subjectTeams = await db.teamMember.findMany({
      where: { userId: subjectId },
      select: { teamId: true },
    });

    const sharedTeams = viewerTeams.some((vt) =>
      subjectTeams.some((st) => st.teamId === vt.teamId),
    );

    if (sharedTeams) return true;

    // Check shared organizations
    const viewerOrgs = await db.organizationMember.findMany({
      where: { userId: viewerId },
      select: { organizationId: true },
    });

    const subjectOrgs = await db.organizationMember.findMany({
      where: { userId: subjectId },
      select: { organizationId: true },
    });

    const sharedOrgs = viewerOrgs.some((vo) =>
      subjectOrgs.some((so) => so.organizationId === vo.organizationId),
    );

    return sharedOrgs;
  } catch (error) {
    console.error("Error checking shared connection:", error);
    return false;
  }
}

// Helper function to check if viewer has superior role over subject
async function checkSuperiorRole(
  db: PrismaClient,
  viewerId: string,
  subjectId: string,
): Promise<boolean> {
  try {
    // Check shared teams with superior role
    const viewerTeams = await db.teamMember.findMany({
      where: { userId: viewerId },
      select: { teamId: true, role: true },
    });

    const subjectTeams = await db.teamMember.findMany({
      where: { userId: subjectId },
      select: { teamId: true },
    });

    for (const viewerTeam of viewerTeams) {
      const subjectInSameTeam = subjectTeams.some(
        (st) => st.teamId === viewerTeam.teamId,
      );

      if (
        subjectInSameTeam &&
        (viewerTeam.role === "OWNER" ||
          viewerTeam.role === "MANAGER" ||
          viewerTeam.role === "TEAM_LEAD")
      ) {
        return true;
      }
    }

    // Check shared organizations with superior role
    const viewerOrgs = await db.organizationMember.findMany({
      where: { userId: viewerId },
      select: { organizationId: true, role: true },
    });

    const subjectOrgs = await db.organizationMember.findMany({
      where: { userId: subjectId },
      select: { organizationId: true },
    });

    for (const viewerOrg of viewerOrgs) {
      const subjectInSameOrg = subjectOrgs.some(
        (so) => so.organizationId === viewerOrg.organizationId,
      );

      if (
        subjectInSameOrg &&
        (viewerOrg.role === "OWNER" ||
          viewerOrg.role === "MANAGER" ||
          viewerOrg.role === "TEAM_LEAD")
      ) {
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error checking superior role:", error);
    return false;
  }
}

export const notesRouter = createTRPCRouter({
  // Get notes (personal or about team members)
  getNotes: protectedProcedure
    .input(
      z.object({
        teamId: z.string().optional(),
        subjectId: z.string().optional(), // Get notes about specific user
        includePrivate: z.boolean().default(false),
        organizationId: z.string().optional(), // Organization context for permissions
      }),
    )
    .query(async ({ ctx, input }) => {
      const { teamId, subjectId, includePrivate, organizationId } = input;
      const user = await getUserFromSession(ctx);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const whereClause: any = {};

      if (subjectId) {
        // Getting notes about a specific user
        const canView = await canViewNotesForMember(
          ctx,
          user.id,
          subjectId,
          includePrivate,
          teamId,
          organizationId,
        );

        if (!canView) {
          throw new Error("No permission to view these notes");
        }

        whereClause.subjectId = subjectId;
        if (teamId) {
          whereClause.teamId = teamId;
        }

        // Add privacy filter based on permissions
        if (includePrivate) {
          // Check if user has superior role - use team or organization context if available
          let isSuperior = false;

          if (teamId) {
            // If we have team context, use the same logic as team management
            const teamManagement = await canUserManageTeam(user.id, teamId);
            isSuperior =
              teamManagement.canManage &&
              (teamManagement.role === "OWNER" ||
                teamManagement.role === "MANAGER" ||
                teamManagement.role === "TEAM_LEAD");
          } else if (organizationId) {
            // If we have organization context, use the same logic as organization management
            const { getUserPermissions, getUserRoleInOrganization } =
              await import("@/lib/permissions");
            const userPermissions = await getUserPermissions(user.id);
            const userOrgRole = getUserRoleInOrganization(
              userPermissions,
              organizationId,
            );

            isSuperior =
              userOrgRole === "OWNER" ||
              userOrgRole === "MANAGER" ||
              userOrgRole === "TEAM_LEAD";
          } else {
            // Fallback to old logic if no team/org context
            isSuperior = await checkSuperiorRole(ctx.db, user.id, subjectId);
          }

          console.log("Privacy check for notes:", {
            userId: user.id,
            subjectId,
            teamId,
            organizationId,
            isSuperior,
            includePrivate,
          });

          if (!isSuperior && user.id !== subjectId) {
            whereClause.isPrivate = false; // Only show public notes
          }
        } else {
          whereClause.isPrivate = false; // Only public notes requested
        }
      } else {
        // Getting user's own notes
        whereClause.authorId = user.id;
        if (teamId) {
          whereClause.teamId = teamId;
        }
        // User can see all their own notes (private and public)
      }

      const notes = await ctx.db.note.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return notes;
    }),

  // Create a new note
  createNote: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required"),
        content: z.string().optional(),
        isPrivate: z.boolean().default(true),
        subjectId: z.string().optional(), // If creating note about someone else (empty string = personal note)
        teamId: z.string().optional(),
        organizationId: z.string().optional(), // Organization context for permissions
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { title, content, isPrivate, subjectId, teamId, organizationId } =
        input;
      const user = await getUserFromSession(ctx);

      // If creating note about someone else, check permissions
      if (subjectId && subjectId !== "" && subjectId !== user.id) {
        const canManage = await canManageNotesForMember(
          ctx,
          user.id,
          subjectId,
          teamId,
          organizationId,
        );

        if (!canManage) {
          throw new Error("No permission to create notes about this user");
        }
      }

      const note = await ctx.db.note.create({
        data: {
          title,
          content,
          isPrivate,
          authorId: user.id,
          subjectId: subjectId === "" ? user.id : subjectId || user.id,
          teamId,
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return note;
    }),

  // Update a note
  updateNote: protectedProcedure
    .input(
      z.object({
        noteId: z.string(),
        title: z.string().min(1, "Title is required").optional(),
        content: z.string().optional(),
        isPrivate: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { noteId, title, content, isPrivate } = input;
      const user = await getUserFromSession(ctx);

      // Get the note to check permissions
      const existingNote = await ctx.db.note.findUnique({
        where: { id: noteId },
        include: {
          team: true,
        },
      });

      if (!existingNote) {
        throw new Error("Note not found");
      }

      // Check if user can edit this note
      let canEdit = false;

      if (existingNote.authorId === user.id) {
        canEdit = true; // Author can always edit their own notes
      } else if (existingNote.teamId) {
        // Check if user can manage the team and the note is about a team member
        const managerCheck = await canUserManageTeam(
          user.id,
          existingNote.teamId,
        );
        canEdit =
          managerCheck.canManage &&
          (managerCheck.role === "OWNER" || managerCheck.role === "MANAGER");
      }

      if (!canEdit) {
        throw new Error("No permission to edit this note");
      }

      // Build update data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (content !== undefined) updateData.content = content;
      if (isPrivate !== undefined) updateData.isPrivate = isPrivate;
      updateData.updatedAt = new Date();

      const updatedNote = await ctx.db.note.update({
        where: { id: noteId },
        data: updateData,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
          },
          subject: {
            select: {
              id: true,
              name: true,
              email: true,
              username: true,
            },
          },
          team: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      return updatedNote;
    }),

  // Delete a note
  deleteNote: protectedProcedure
    .input(z.object({ noteId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { noteId } = input;
      const user = await getUserFromSession(ctx);

      // Get the note to check permissions
      const existingNote = await ctx.db.note.findUnique({
        where: { id: noteId },
      });

      if (!existingNote) {
        throw new Error("Note not found");
      }

      // Check if user can delete this note
      let canDelete = false;

      if (existingNote.authorId === user.id) {
        canDelete = true; // Author can always delete their own notes
      } else if (existingNote.teamId) {
        // Only organization owners can delete notes created by others
        const managerCheck = await canUserManageTeam(
          user.id,
          existingNote.teamId,
        );
        canDelete = managerCheck.canManage && managerCheck.role === "OWNER";
      }

      if (!canDelete) {
        throw new Error("No permission to delete this note");
      }

      await ctx.db.note.delete({
        where: { id: noteId },
      });

      return { success: true, message: "Note deleted successfully" };
    }),

  // Get team members for note creation (for dropdown)
  getTeamMembers: protectedProcedure
    .input(z.object({ teamId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { teamId } = input;
      const user = await getUserFromSession(ctx);

      // Check if user can manage this team
      const managerCheck = await canUserManageTeam(user.id, teamId);
      if (!managerCheck.canManage) {
        throw new Error("No permission to view team members");
      }

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
        role: member.role,
      }));
    }),
});
