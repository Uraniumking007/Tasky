"use server";

import { db } from "@/server/db";
import {
  sendTeamInvitationEmail,
  sendOrganizationInvitationEmail,
} from "@/lib/email";

export async function createOrganization(orgName: string, userId: string) {
  if (!orgName || !userId) return { success: false, message: "Missing data." };
  // Check for duplicate org name for this user
  const existing = await db.organization.findFirst({
    where: { name: orgName, ownerId: userId },
  });
  if (existing) {
    return {
      success: false,
      message: "You already have an organization with this name.",
    };
  }
  await db.organization.create({
    data: {
      name: orgName,
      owner: { connect: { id: userId } },
    },
  });
  return { success: true };
}

export async function createTeam(
  teamName: string,
  userId: string,
  orgId: string,
) {
  if (!teamName || !userId || !orgId)
    return { success: false, message: "Missing data." };
  // Check for duplicate team name in this org
  const existing = await db.team.findFirst({
    where: { name: teamName, organizationId: orgId },
  });
  if (existing) {
    return {
      success: false,
      message: "A team with this name already exists in this organization.",
    };
  }
  await db.team.create({
    data: {
      name: teamName,
      owner: { connect: { id: userId } },
      organization: { connect: { id: orgId } },
    },
  });
  return { success: true };
}

export async function editOrganization(
  orgId: string,
  newName: string,
  userId: string,
) {
  if (!orgId || !newName || !userId)
    return { success: false, message: "Missing data." };
  // Check for duplicate org name for this user
  const existing = await db.organization.findFirst({
    where: { name: newName, ownerId: userId, NOT: { id: orgId } },
  });
  if (existing) {
    return {
      success: false,
      message: "You already have an organization with this name.",
    };
  }
  await db.organization.update({
    where: { id: orgId, ownerId: userId },
    data: { name: newName },
  });
  return { success: true };
}

export async function deleteOrganization(orgId: string, userId: string) {
  if (!orgId || !userId) return { success: false, message: "Missing data." };
  await db.organization.delete({
    where: { id: orgId, ownerId: userId },
  });
  return { success: true };
}

export async function editTeam(teamId: string, newName: string, orgId: string) {
  if (!teamId || !newName || !orgId)
    return { success: false, message: "Missing data." };
  // Check for duplicate team name in this org
  const existing = await db.team.findFirst({
    where: { name: newName, organizationId: orgId, NOT: { id: teamId } },
  });
  if (existing) {
    return {
      success: false,
      message: "A team with this name already exists in this organization.",
    };
  }
  await db.team.update({
    where: { id: teamId },
    data: { name: newName },
  });
  return { success: true };
}

export async function deleteTeam(teamId: string) {
  if (!teamId) return { success: false, message: "Missing data." };
  await db.team.delete({
    where: { id: teamId },
  });
  return { success: true };
}

export async function addUserToTeam(teamId: string, userId: string) {
  const user = await db.users.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error("User not found");
  }
  await db.team.update({
    where: { id: teamId },
    data: {
      members: { connect: { id: userId } },
    },
  });
}

export async function addUserToOrganization(
  organizationId: string,
  userId: string,
) {
  await db.organization.update({
    where: { id: organizationId },
    data: { members: { connect: { id: userId } } },
  });
}

export async function inviteUserToTeam(
  teamId: string,
  email: string,
  invitedBy: string,
) {
  if (!teamId || !email || !invitedBy)
    return { success: false, message: "Missing data." };

  // Check for existing pending invite
  const existing = await db.teamInvite.findFirst({
    where: {
      teamId,
      email,
      status: "pending",
      expiry: {
        gt: new Date(), // Only consider non-expired invitations
      },
    },
  });
  if (existing) {
    return {
      success: false,
      message: "An invite for this email is already pending for this team.",
    };
  }

  // Set expiry to 7 days from now
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  // Create the invitation
  const invitation = await db.teamInvite.create({
    data: {
      teamId,
      email,
      invitedBy,
      expiry,
    },
    include: {
      team: {
        include: {
          organization: true,
        },
      },
      inviter: {
        select: {
          name: true,
          username: true,
        },
      },
    },
  });

  // Send email invitation
  try {
    const inviterName =
      invitation.inviter.name || invitation.inviter.username || "A team member";
    const inviteUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/invite/team/${invitation.id}`;

    const emailResult = await sendTeamInvitationEmail({
      inviteeEmail: email,
      inviterName,
      teamName: invitation.team.name,
      organizationName: invitation.team.organization?.name,
      inviteUrl,
      expiryDate: expiry,
    });

    if (!emailResult.success) {
      console.error("Failed to send invitation email:", emailResult.error);
      // Don't fail the invitation if email fails, but log it
    }
  } catch (error) {
    console.error("Error sending invitation email:", error);
    // Don't fail the invitation if email fails, but log it
  }

  return { success: true };
}

export async function checkAndUpdateExpiredInvites() {
  // Find all expired pending invitations and mark them as expired
  const expiredInvites = await db.teamInvite.findMany({
    where: {
      status: "pending",
      expiry: {
        lt: new Date(),
      },
    },
  });

  if (expiredInvites.length > 0) {
    await db.teamInvite.updateMany({
      where: {
        status: "pending",
        expiry: {
          lt: new Date(),
        },
      },
      data: {
        status: "expired",
      },
    });
  }

  return expiredInvites.length;
}

export async function getValidInvites(teamId: string) {
  // Get all non-expired invitations for a team
  return await db.teamInvite.findMany({
    where: {
      teamId,
      status: "pending",
      expiry: {
        gt: new Date(),
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function cancelTeamInvite(inviteId: string, userId: string) {
  if (!inviteId || !userId) return { success: false, message: "Missing data." };

  // Get the invitation and check permissions
  const invite = await db.teamInvite.findUnique({
    where: { id: inviteId },
    include: {
      team: {
        include: { members: true },
      },
    },
  });

  if (!invite) {
    return { success: false, message: "Invitation not found." };
  }

  // Check if user has permission to cancel this invitation
  const isOwner = invite.team.ownerId === userId;
  const isManager = invite.team.members.some(
    (member) => member.userId === userId && member.role === "MANAGER",
  );
  const isInviter = invite.invitedBy === userId;

  if (!isOwner && !isManager && !isInviter) {
    return {
      success: false,
      message: "You don't have permission to cancel this invitation.",
    };
  }

  await db.teamInvite.update({
    where: { id: inviteId },
    data: { status: "cancelled" },
  });

  return { success: true };
}

export async function inviteUserToOrganization(
  organizationId: string,
  email: string,
  invitedBy: string,
) {
  if (!organizationId || !email || !invitedBy)
    return { success: false, message: "Missing data." };

  // Check for existing membership
  const existingMember = await db.organizationMember.findFirst({
    where: {
      organizationId,
      user: { email },
    },
  });
  if (existingMember) {
    return {
      success: false,
      message: "This user is already a member of this organization.",
    };
  }

  // Check for existing pending invite
  const existingInvite = await db.organizationInvite.findFirst({
    where: {
      organizationId,
      email,
      status: "pending",
      expiry: {
        gt: new Date(), // Only consider non-expired invitations
      },
    },
  });
  if (existingInvite) {
    return {
      success: false,
      message:
        "An invite for this email is already pending for this organization.",
    };
  }

  // Set expiry to 7 days from now
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + 7);

  // Create the invitation
  const invitation = await db.organizationInvite.create({
    data: {
      organizationId,
      email,
      invitedBy,
      expiry,
    },
    include: {
      organization: true,
      inviter: {
        select: {
          name: true,
          username: true,
        },
      },
    },
  });

  // Send email invitation
  try {
    const inviterName =
      invitation.inviter.name ||
      invitation.inviter.username ||
      "An organization member";
    const inviteUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/invite/organization/${invitation.id}`;

    const emailResult = await sendOrganizationInvitationEmail({
      inviteeEmail: email,
      inviterName,
      organizationName: invitation.organization.name,
      inviteUrl,
      expiryDate: expiry,
    });

    if (!emailResult.success) {
      console.error(
        "Failed to send organization invitation email:",
        emailResult.error,
      );
      // Don't fail the invitation if email fails, but log it
    }
  } catch (error) {
    console.error("Error sending organization invitation email:", error);
    // Don't fail the invitation if email fails, but log it
  }

  return { success: true };
}

export async function removeUserFromOrganization(
  organizationId: string,
  userIdToRemove: string,
  requestedBy: string,
) {
  if (!organizationId || !userIdToRemove || !requestedBy)
    return { success: false, message: "Missing data." };

  // Check if the requesting user is the organization owner
  const organization = await db.organization.findFirst({
    where: { id: organizationId, ownerId: requestedBy },
  });

  if (!organization) {
    return {
      success: false,
      message:
        "You don't have permission to remove members from this organization.",
    };
  }

  // Check if the user to remove is actually a member
  const member = await db.organizationMember.findFirst({
    where: {
      organizationId,
      userId: userIdToRemove,
    },
  });

  if (!member) {
    return {
      success: false,
      message: "This user is not a member of this organization.",
    };
  }

  // Prevent removing the organization owner
  if (userIdToRemove === requestedBy) {
    return {
      success: false,
      message:
        "You cannot remove yourself from the organization. Transfer ownership first.",
    };
  }

  // Remove the user from the organization
  await db.organizationMember.delete({
    where: {
      id: member.id,
    },
  });

  return { success: true };
}
