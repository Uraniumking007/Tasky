"use server";

import { db } from "@/server/db";
import { revalidatePath } from "next/cache";

export async function acceptOrganizationInvite(
  inviteId: string,
  userId: string,
) {
  try {
    // Get the invitation with organization details
    const invitation = await db.organizationInvite.findUnique({
      where: { id: inviteId },
      include: {
        organization: true,
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

    // Check if user is already an organization member
    const existingMember = await db.organizationMember.findFirst({
      where: {
        organizationId: invitation.organizationId,
        userId,
      },
    });

    if (existingMember) {
      return {
        success: false,
        message: "You are already a member of this organization",
      };
    }

    // Check for pending team invites for this email

    const pendingTeamInvites = await db.teamInvite.findMany({
      where: {
        email: user.email,
        status: "pending",
        team: {
          organizationId: invitation.organizationId,
        },
      },
      include: {
        team: true,
      },
    });

    // Create organization membership, update invitation status, and add to teams in a transaction
    await db.$transaction(async (tx) => {
      // Create organization membership
      await tx.organizationMember.create({
        data: {
          organizationId: invitation.organizationId,
          userId,
          role: "MEMBER",
        },
      });

      // Update invitation status
      await tx.organizationInvite.update({
        where: { id: inviteId },
        data: { status: "accepted" },
      });

      // Add team memberships for pending team invites
      for (const teamInvite of pendingTeamInvites) {
        // Create team membership
        await tx.teamMember.create({
          data: {
            teamId: teamInvite.teamId,
            userId,
            role: "MEMBER",
          },
        });

        // Update team invite status
        await tx.teamInvite.update({
          where: { id: teamInvite.id },
          data: { status: "accepted" },
        });
      }
    });

    // Revalidate relevant paths
    revalidatePath(`/organization/${invitation.organizationId}`);

    const teamMessage =
      pendingTeamInvites.length > 0
        ? ` You've also been added to ${pendingTeamInvites.length} team(s).`
        : "";

    return {
      success: true,
      message: `Welcome to ${invitation.organization.name}!${teamMessage}`,
      redirectTo: `/organization/${invitation.organizationId}`,
    };
  } catch (error) {
    console.error("Error accepting organization invitation:", error);
    return { success: false, message: "Failed to accept invitation" };
  }
}

export async function declineOrganizationInvite(
  inviteId: string,
  userId: string,
) {
  try {
    // Get the invitation
    const invitation = await db.organizationInvite.findUnique({
      where: { id: inviteId },
      include: {
        organization: true,
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
    await db.organizationInvite.update({
      where: { id: inviteId },
      data: { status: "declined" },
    });

    return {
      success: true,
      message: `You have declined the invitation to join ${invitation.organization.name}`,
    };
  } catch (error) {
    console.error("Error declining organization invitation:", error);
    return { success: false, message: "Failed to decline invitation" };
  }
}
