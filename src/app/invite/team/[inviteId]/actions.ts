"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function acceptTeamInvite(inviteId: string, userId: string) {
  try {
    // Get the invitation with team details
    const invitation = await db.teamInvite.findUnique({
      where: { id: inviteId },
      include: {
        team: {
          include: {
            organization: true,
          },
        },
      },
    });

    if (!invitation) {
      return { success: false, message: "Invitation not found" };
    }

    // Check if invitation is expired
    if (invitation.expiry < new Date()) {
      return { success: false, message: "This invitation has expired" };
    }

    // Check if invitation is still pending
    if (invitation.status !== "pending") {
      return {
        success: false,
        message: `This invitation has already been ${invitation.status}`,
      };
    }

    // Get the user
    const user = await db.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check if email matches
    if (invitation.email !== user.email) {
      return {
        success: false,
        message:
          "Email mismatch. This invitation was sent to a different email address.",
      };
    }

    // Check if user is already a team member
    const existingMember = await db.teamMember.findFirst({
      where: {
        teamId: invitation.teamId,
        userId,
      },
    });

    if (existingMember) {
      return {
        success: false,
        message: "You are already a member of this team",
      };
    }

    // If team belongs to an organization, ensure user is an organization member first
    if (invitation.team.organization && invitation.team.organizationId) {
      const orgMember = await db.organizationMember.findFirst({
        where: {
          organizationId: invitation.team.organizationId,
          userId,
        },
      });

      if (!orgMember) {
        return {
          success: false,
          message:
            "You must be a member of the organization first to join this team",
        };
      }
    }

    // Create team membership and update invitation status in a transaction
    await db.$transaction([
      // Create team membership
      db.teamMember.create({
        data: {
          teamId: invitation.teamId,
          userId,
          role: "MEMBER",
        },
      }),
      // Update invitation status
      db.teamInvite.update({
        where: { id: inviteId },
        data: { status: "accepted" },
      }),
    ]);

    // Revalidate relevant paths
    revalidatePath(`/team/${invitation.teamId}`);
    if (invitation.team.organizationId) {
      revalidatePath(`/organization/${invitation.team.organizationId}`);
    }

    return {
      success: true,
      message: `Welcome to ${invitation.team.name}!`,
      redirectTo: `/team/${invitation.teamId}`,
    };
  } catch (error) {
    console.error("Error accepting team invitation:", error);
    return { success: false, message: "Failed to accept invitation" };
  }
}

export async function declineTeamInvite(inviteId: string, userId: string) {
  try {
    // Get the invitation
    const invitation = await db.teamInvite.findUnique({
      where: { id: inviteId },
      include: {
        team: true,
      },
    });

    if (!invitation) {
      return { success: false, message: "Invitation not found" };
    }

    // Check if invitation is still pending
    if (invitation.status !== "pending") {
      return {
        success: false,
        message: `This invitation has already been ${invitation.status}`,
      };
    }

    // Get the user
    const user = await db.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check if email matches
    if (invitation.email !== user.email) {
      return {
        success: false,
        message:
          "Email mismatch. This invitation was sent to a different email address.",
      };
    }

    // Update invitation status to declined
    await db.teamInvite.update({
      where: { id: inviteId },
      data: { status: "declined" },
    });

    return {
      success: true,
      message: `You have declined the invitation to join ${invitation.team.name}`,
    };
  } catch (error) {
    console.error("Error declining team invitation:", error);
    return { success: false, message: "Failed to decline invitation" };
  }
}
