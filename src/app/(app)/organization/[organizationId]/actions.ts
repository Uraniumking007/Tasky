"use server";

import { db } from "@/server/db";
import { getServerAuthSession } from "@/server/auth";
import {
  getUserPermissions,
  getUserRoleInOrganization,
  getRolePermissions,
  canUserManageTeam,
} from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { sendOrganizationInvitationEmail } from "@/lib/email";

export async function inviteOrganizationMember(
  organizationId: string,
  email: string,
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.users.findFirst({
      where: {
        OR: [
          { email: session.user.email },
          { username: session.user.username },
        ],
      },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check permissions
    const permissions = await getUserPermissions(user.id);
    const userRole = getUserRoleInOrganization(permissions, organizationId);

    if (!userRole) {
      return { success: false, message: "No access to organization" };
    }

    const rolePermissions = getRolePermissions(userRole);
    if (!rolePermissions.canInviteOrganizationMembers) {
      return { success: false, message: "No permission to invite members" };
    }

    // Check if user is already a member
    const existingMember = await db.organizationMember.findFirst({
      where: {
        organizationId,
        user: { email },
      },
    });

    if (existingMember) {
      return { success: false, message: "User is already a member" };
    }

    // Check for existing pending invitation
    const existingInvite = await db.organizationInvite.findFirst({
      where: {
        organizationId,
        email,
        status: "pending",
        expiry: {
          gt: new Date(),
        },
      },
    });

    if (existingInvite) {
      return {
        success: false,
        message: "Invitation already sent to this email",
      };
    }

    // Get organization details for email
    const organization = await db.organization.findUnique({
      where: { id: organizationId },
      select: { name: true },
    });

    if (!organization) {
      return { success: false, message: "Organization not found" };
    }

    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create organization invite
    const invite = await db.organizationInvite.create({
      data: {
        organizationId,
        email,
        invitedBy: user.id,
        expiry: expiryDate,
      },
    });

    // Send email invitation
    try {
      const inviteUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/invite/organization/${invite.id}`;

      const emailResult = await sendOrganizationInvitationEmail({
        inviteeEmail: email,
        inviterName: user.name || user.username || "A team member",
        organizationName: organization.name,
        inviteUrl,
        expiryDate,
      });

      if (!emailResult.success) {
        console.error("Failed to send invitation email:", emailResult.error);
        // Don't fail the invitation if email fails, but log it
      }
    } catch (error) {
      console.error("Error sending invitation email:", error);
      // Don't fail the invitation if email fails, but log it
    }

    revalidatePath(`/organization/${organizationId}`);
    return {
      success: true,
      message: `Invitation sent to ${email}. They will receive an email with the invite link.`,
      inviteId: invite.id,
    };
  } catch (error) {
    console.error("Error inviting organization member:", error);
    return { success: false, message: "Failed to send invitation" };
  }
}

export async function removeOrganizationMember(
  organizationId: string,
  memberUserId: string,
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.users.findFirst({
      where: {
        OR: [
          { email: session.user.email },
          { username: session.user.username },
        ],
      },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check permissions
    const permissions = await getUserPermissions(user.id);
    const userRole = getUserRoleInOrganization(permissions, organizationId);

    if (!userRole) {
      return { success: false, message: "No access to organization" };
    }

    const rolePermissions = getRolePermissions(userRole);
    if (!rolePermissions.canRemoveOrganizationMembers) {
      return { success: false, message: "No permission to remove members" };
    }

    // Can't remove yourself or organization owner
    if (memberUserId === user.id) {
      return { success: false, message: "Cannot remove yourself" };
    }

    const memberToRemove = await db.organizationMember.findFirst({
      where: {
        organizationId,
        userId: memberUserId,
      },
    });

    if (!memberToRemove) {
      return { success: false, message: "Member not found" };
    }

    if (memberToRemove.role === "OWNER") {
      return { success: false, message: "Cannot remove organization owner" };
    }

    // Remove from organization
    await db.organizationMember.delete({
      where: {
        id: memberToRemove.id,
      },
    });

    // Also remove from all teams in the organization
    await db.teamMember.deleteMany({
      where: {
        userId: memberUserId,
        team: {
          organizationId,
        },
      },
    });

    revalidatePath(`/organization/${organizationId}`);
    return { success: true, message: "Member removed successfully" };
  } catch (error) {
    console.error("Error removing organization member:", error);
    return { success: false, message: "Failed to remove member" };
  }
}

export async function createTeamInOrganization(
  organizationId: string,
  teamName: string,
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.users.findFirst({
      where: {
        OR: [
          { email: session.user.email },
          { username: session.user.username },
        ],
      },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check permissions
    const permissions = await getUserPermissions(user.id);
    const userRole = getUserRoleInOrganization(permissions, organizationId);

    if (!userRole) {
      return { success: false, message: "No access to organization" };
    }

    const rolePermissions = getRolePermissions(userRole);
    if (!rolePermissions.canCreateTeams) {
      return { success: false, message: "No permission to create teams" };
    }

    // Create team (owner is not automatically added as team member)
    const team = await db.team.create({
      data: {
        name: teamName,
        organizationId,
        ownerId: user.id,
      },
    });

    revalidatePath(`/organization/${organizationId}`);
    return {
      success: true,
      message: "Team created successfully",
      teamId: team.id,
    };
  } catch (error) {
    console.error("Error creating team:", error);
    return { success: false, message: "Failed to create team" };
  }
}

export async function addTeamMember(teamId: string, userId: string) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const currentUser = await db.users.findFirst({
      where: {
        OR: [
          { email: session.user.email },
          { username: session.user.username },
        ],
      },
    });

    if (!currentUser) {
      return { success: false, message: "User not found" };
    }

    // Get team and check permissions
    const team = await db.team.findUnique({
      where: { id: teamId },
      include: {
        members: true,
        organization: {
          include: {
            members: true,
          },
        },
      },
    });

    if (!team) {
      return { success: false, message: "Team not found" };
    }

    // Check if current user can manage team members
    const managementCheck = await canUserManageTeam(currentUser.id, teamId);
    if (!managementCheck.canManage) {
      return { success: false, message: "No permission to add team members" };
    }

    // Find user to add
    const userToAdd = await db.users.findFirst({
      where: { id: userId },
    });

    if (!userToAdd) {
      return { success: false, message: "User not found" };
    }

    // Check if user is member of organization
    if (!team.organization) {
      return { success: false, message: "Team is not part of an organization" };
    }

    const isOrgMember = team.organization.members.some(
      (m) => m.userId === userToAdd.id,
    );
    if (!isOrgMember) {
      return {
        success: false,
        message: "User must be an organization member first",
      };
    }

    // Check if already team member
    const existingTeamMember = team.members.find(
      (m) => m.userId === userToAdd.id,
    );
    if (existingTeamMember) {
      return { success: false, message: "User is already a team member" };
    }

    // Add to team
    await db.teamMember.create({
      data: {
        teamId,
        userId: userToAdd.id,
        role: "MEMBER",
      },
    });

    revalidatePath(`/organization/${team.organizationId}`);
    revalidatePath(`/team/${teamId}`);
    return { success: true, message: "Team member added successfully" };
  } catch (error) {
    console.error("Error adding team member:", error);
    return { success: false, message: "Failed to add team member" };
  }
}

export async function getOrganizationInvites(organizationId: string) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.users.findFirst({
      where: {
        OR: [
          { email: session.user.email },
          { username: session.user.username },
        ],
      },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check permissions
    const permissions = await getUserPermissions(user.id);
    const userRole = getUserRoleInOrganization(permissions, organizationId);

    if (!userRole) {
      return { success: false, message: "No access to organization" };
    }

    const rolePermissions = getRolePermissions(userRole);
    if (!rolePermissions.canInviteOrganizationMembers) {
      return { success: false, message: "No permission to view invites" };
    }

    // Get all invites for this organization
    const invites = await db.organizationInvite.findMany({
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

    return {
      success: true,
      invites: invites.map((invite) => ({
        id: invite.id,
        email: invite.email,
        status: invite.status,
        createdAt: invite.createdAt,
        expiry: invite.expiry,
        inviterName:
          invite.inviter.name ||
          invite.inviter.username ||
          invite.inviter.email,
      })),
    };
  } catch (error) {
    console.error("Error fetching organization invites:", error);
    return { success: false, message: "Failed to fetch invites" };
  }
}

export async function cancelOrganizationInvite(inviteId: string) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.users.findFirst({
      where: {
        OR: [
          { email: session.user.email },
          { username: session.user.username },
        ],
      },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Get the invite to check organization and permissions
    const invite = await db.organizationInvite.findUnique({
      where: { id: inviteId },
      include: {
        organization: true,
      },
    });

    if (!invite) {
      return { success: false, message: "Invitation not found" };
    }

    // Check permissions
    const permissions = await getUserPermissions(user.id);
    const userRole = getUserRoleInOrganization(
      permissions,
      invite.organizationId,
    );

    if (!userRole) {
      return { success: false, message: "No access to organization" };
    }

    const rolePermissions = getRolePermissions(userRole);
    if (!rolePermissions.canInviteOrganizationMembers) {
      return { success: false, message: "No permission to manage invites" };
    }

    // Only allow canceling pending invites
    if (invite.status !== "pending") {
      return {
        success: false,
        message: `Cannot cancel ${invite.status} invitation`,
      };
    }

    // Cancel the invitation by updating status
    await db.organizationInvite.update({
      where: { id: inviteId },
      data: {
        status: "cancelled",
      },
    });

    return { success: true, message: "Invitation cancelled successfully" };
  } catch (error) {
    console.error("Error cancelling organization invite:", error);
    return { success: false, message: "Failed to cancel invitation" };
  }
}

export async function resendOrganizationInvite(inviteId: string) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.users.findFirst({
      where: {
        OR: [
          { email: session.user.email },
          { username: session.user.username },
        ],
      },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Get the invite with organization details
    const invite = await db.organizationInvite.findUnique({
      where: { id: inviteId },
      include: {
        organization: true,
      },
    });

    if (!invite) {
      return { success: false, message: "Invitation not found" };
    }

    // Check permissions
    const permissions = await getUserPermissions(user.id);
    const userRole = getUserRoleInOrganization(
      permissions,
      invite.organizationId,
    );

    if (!userRole) {
      return { success: false, message: "No access to organization" };
    }

    const rolePermissions = getRolePermissions(userRole);
    if (!rolePermissions.canInviteOrganizationMembers) {
      return { success: false, message: "No permission to resend invites" };
    }

    // Only allow resending pending invites
    if (invite.status !== "pending") {
      return {
        success: false,
        message: `Cannot resend ${invite.status} invitation`,
      };
    }

    // Extend expiry and update invite
    const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    await db.organizationInvite.update({
      where: { id: inviteId },
      data: {
        expiry: newExpiry,
      },
    });

    // Send email invitation again
    try {
      const inviteUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/invite/organization/${inviteId}`;

      const emailResult = await sendOrganizationInvitationEmail({
        inviteeEmail: invite.email,
        inviterName: user.name || user.username || "A team member",
        organizationName: invite.organization.name,
        inviteUrl,
        expiryDate: newExpiry,
      });

      if (!emailResult.success) {
        console.error("Failed to send invitation email:", emailResult.error);
        // Don't fail the action if email fails
      }
    } catch (error) {
      console.error("Error sending invitation email:", error);
      // Don't fail the action if email fails
    }

    return { success: true, message: "Invitation resent successfully" };
  } catch (error) {
    console.error("Error resending organization invite:", error);
    return { success: false, message: "Failed to resend invitation" };
  }
}

export async function getAvailableOrganizationMembers(
  organizationId: string,
  teamId: string,
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.users.findFirst({
      where: {
        OR: [
          { email: session.user.email },
          { username: session.user.username },
        ],
      },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check if user can manage the team
    const managementCheck = await canUserManageTeam(user.id, teamId);
    if (!managementCheck.canManage) {
      return {
        success: false,
        message: "No permission to manage team members",
      };
    }

    // Get organization members and current team members
    const [organization, team] = await Promise.all([
      db.organization.findUnique({
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
      db.team.findUnique({
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
      return { success: false, message: "Organization or team not found" };
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

    return {
      success: true,
      members: availableMembers,
    };
  } catch (error) {
    console.error("Error fetching available organization members:", error);
    return { success: false, message: "Failed to fetch organization members" };
  }
}

export async function inviteToOrganizationAndTeam(
  organizationId: string,
  teamId: string,
  email: string,
) {
  try {
    const session = await getServerAuthSession();
    if (!session?.user) {
      return { success: false, message: "Unauthorized" };
    }

    const user = await db.users.findFirst({
      where: {
        OR: [
          { email: session.user.email },
          { username: session.user.username },
        ],
      },
    });

    if (!user) {
      return { success: false, message: "User not found" };
    }

    // Check if user can manage the team
    const managementCheck = await canUserManageTeam(user.id, teamId);
    if (!managementCheck.canManage) {
      return {
        success: false,
        message: "No permission to invite team members",
      };
    }

    // Check organization permissions
    const permissions = await getUserPermissions(user.id);
    const userRole = getUserRoleInOrganization(permissions, organizationId);
    if (!userRole) {
      return { success: false, message: "No access to organization" };
    }

    const rolePermissions = getRolePermissions(userRole);
    if (!rolePermissions.canInviteOrganizationMembers) {
      return {
        success: false,
        message: "No permission to invite organization members",
      };
    }

    // Check if email is already invited to organization
    const existingOrgInvite = await db.organizationInvite.findFirst({
      where: {
        organizationId,
        email,
        status: "pending",
      },
    });

    // Check if user is already an organization member
    const existingOrgMember = await db.users.findFirst({
      where: { email },
      include: {
        organizationMemberships: {
          where: { organizationId },
        },
      },
    });

    if (
      existingOrgMember &&
      existingOrgMember.organizationMemberships.length > 0
    ) {
      return {
        success: false,
        message: "User is already an organization member",
      };
    }

    // Get organization and team details
    const [organization, team] = await Promise.all([
      db.organization.findUnique({
        where: { id: organizationId },
      }),
      db.team.findUnique({
        where: { id: teamId },
      }),
    ]);

    if (!organization || !team) {
      return { success: false, message: "Organization or team not found" };
    }

    const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    let orgInviteId = existingOrgInvite?.id;

    // Create organization invite if it doesn't exist
    if (!existingOrgInvite) {
      const orgInvite = await db.organizationInvite.create({
        data: {
          email,
          organizationId,
          invitedBy: user.id,
          expiry: expiryDate,
        },
      });
      orgInviteId = orgInvite.id;
    }

    // Check if there's already a team invite for this email/team
    const existingTeamInvite = await db.teamInvite.findFirst({
      where: {
        teamId,
        email,
        status: "pending",
      },
    });

    let teamInviteId: string;

    if (existingTeamInvite) {
      // Update expiry of existing team invite
      await db.teamInvite.update({
        where: { id: existingTeamInvite.id },
        data: { expiry: expiryDate },
      });
      teamInviteId = existingTeamInvite.id;
    } else {
      // Create new team invite
      const teamInvite = await db.teamInvite.create({
        data: {
          email,
          teamId,
          invitedBy: user.id,
          expiry: expiryDate,
        },
      });
      teamInviteId = teamInvite.id;
    }

    // Send email invitation (organization invite with team context)
    try {
      const orgInviteUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/invite/organization/${orgInviteId}`;

      const emailResult = await sendOrganizationInvitationEmail({
        inviteeEmail: email,
        inviterName: user.name || user.username || "A team member",
        organizationName: organization.name,
        inviteUrl: orgInviteUrl,
        expiryDate,
      });

      if (!emailResult.success) {
        console.error("Failed to send invitation email:", emailResult.error);
        // Don't fail the action if email fails
      }
    } catch (error) {
      console.error("Error sending invitation email:", error);
      // Don't fail the action if email fails
    }

    revalidatePath(`/organization/${organizationId}`);
    revalidatePath(`/team/${teamId}`);

    return {
      success: true,
      message: `Invitation sent to ${email} for organization and team access`,
      organizationInviteId: orgInviteId,
      teamInviteId,
    };
  } catch (error) {
    console.error("Error inviting to organization and team:", error);
    return { success: false, message: "Failed to send invitation" };
  }
}
