import { db } from "@/server/db";
import type { User } from "next-auth";

export interface UserPermissions {
  hasTeamAccess: boolean;
  hasOrganizationAccess: boolean;
  isTeamOwner: boolean;
  isTeamManager: boolean;
  isOrganizationOwner: boolean;
  isOrganizationManager: boolean;
  userTeams: Array<{
    id: string;
    name: string;
    role: "OWNER" | "MANAGER" | "MEMBER";
    organizationId?: string;
  }>;
  userOrganizations: Array<{
    id: string;
    name: string;
    role: "OWNER" | "MANAGER" | "MEMBER";
  }>;
}

export interface RolePermissions {
  // Organization level permissions
  canViewOrganization: boolean;
  canViewOrganizationMembers: boolean;
  canViewAllTeams: boolean;
  canManageOrganization: boolean;
  canInviteOrganizationMembers: boolean;
  canRemoveOrganizationMembers: boolean;
  canEditOrganization: boolean;
  canDeleteOrganization: boolean;

  // Team level permissions
  canViewOwnTeam: boolean;
  canViewAllTeamsInOrg: boolean;
  canCreateTeams: boolean;
  canEditTeams: boolean;
  canDeleteTeams: boolean;
  canManageTeamMembers: boolean;
  canInviteTeamMembers: boolean;
  canRemoveTeamMembers: boolean;

  // Notes permissions
  canViewOwnNotes: boolean;
  canViewTeamNotes: boolean;
  canAddNotesToMembers: boolean;
  canEditAllNotes: boolean;
  canDeleteNotes: boolean;
}

export function getRolePermissions(
  role: "OWNER" | "MANAGER" | "MEMBER",
): RolePermissions {
  switch (role) {
    case "OWNER":
      return {
        // Organization level - full access
        canViewOrganization: true,
        canViewOrganizationMembers: true,
        canViewAllTeams: true,
        canManageOrganization: true,
        canInviteOrganizationMembers: true,
        canRemoveOrganizationMembers: true,
        canEditOrganization: true,
        canDeleteOrganization: true,

        // Team level - full access
        canViewOwnTeam: true,
        canViewAllTeamsInOrg: true,
        canCreateTeams: true,
        canEditTeams: true,
        canDeleteTeams: true,
        canManageTeamMembers: true,
        canInviteTeamMembers: true,
        canRemoveTeamMembers: true,

        // Notes - full access
        canViewOwnNotes: true,
        canViewTeamNotes: true,
        canAddNotesToMembers: true,
        canEditAllNotes: true,
        canDeleteNotes: true,
      };

    case "MANAGER":
      return {
        // Organization level - management access
        canViewOrganization: true,
        canViewOrganizationMembers: true,
        canViewAllTeams: true,
        canManageOrganization: true,
        canInviteOrganizationMembers: true,
        canRemoveOrganizationMembers: false, // Can't remove org members
        canEditOrganization: false, // Can't edit org details
        canDeleteOrganization: false, // Can't delete org

        // Team level - management access
        canViewOwnTeam: true,
        canViewAllTeamsInOrg: true,
        canCreateTeams: true,
        canEditTeams: true,
        canDeleteTeams: false, // Can't delete teams
        canManageTeamMembers: true,
        canInviteTeamMembers: true,
        canRemoveTeamMembers: true,

        // Notes - management access
        canViewOwnNotes: true,
        canViewTeamNotes: true,
        canAddNotesToMembers: true,
        canEditAllNotes: true,
        canDeleteNotes: false, // Can't delete notes
      };

    case "MEMBER":
      return {
        // Organization level - basic access
        canViewOrganization: true,
        canViewOrganizationMembers: true,
        canViewAllTeams: false, // Can only see their own teams
        canManageOrganization: false,
        canInviteOrganizationMembers: false,
        canRemoveOrganizationMembers: false,
        canEditOrganization: false,
        canDeleteOrganization: false,

        // Team level - basic access
        canViewOwnTeam: true,
        canViewAllTeamsInOrg: false,
        canCreateTeams: false,
        canEditTeams: false,
        canDeleteTeams: false,
        canManageTeamMembers: false,
        canInviteTeamMembers: false,
        canRemoveTeamMembers: false,

        // Notes - basic access
        canViewOwnNotes: true,
        canViewTeamNotes: false, // Can only see their own notes
        canAddNotesToMembers: false,
        canEditAllNotes: false,
        canDeleteNotes: false,
      };

    default:
      return {
        canViewOrganization: false,
        canViewOrganizationMembers: false,
        canViewAllTeams: false,
        canManageOrganization: false,
        canInviteOrganizationMembers: false,
        canRemoveOrganizationMembers: false,
        canEditOrganization: false,
        canDeleteOrganization: false,
        canViewOwnTeam: false,
        canViewAllTeamsInOrg: false,
        canCreateTeams: false,
        canEditTeams: false,
        canDeleteTeams: false,
        canManageTeamMembers: false,
        canInviteTeamMembers: false,
        canRemoveTeamMembers: false,
        canViewOwnNotes: false,
        canViewTeamNotes: false,
        canAddNotesToMembers: false,
        canEditAllNotes: false,
        canDeleteNotes: false,
      };
  }
}

export async function getUserPermissions(
  userId: string,
): Promise<UserPermissions> {
  // Get user's team memberships
  const teamMemberships = await db.teamMember.findMany({
    where: { userId },
    include: {
      team: {
        include: {
          organization: true,
        },
      },
    },
  });

  // Get user's organization memberships
  const organizationMemberships = await db.organizationMember.findMany({
    where: { userId },
    include: {
      organization: true,
    },
  });

  // Get teams owned by user
  const ownedTeams = await db.team.findMany({
    where: { ownerId: userId },
    include: {
      organization: true,
    },
  });

  // Get organizations owned by user
  const ownedOrganizations = await db.organization.findMany({
    where: { ownerId: userId },
  });

  const userTeams = [
    ...teamMemberships.map((membership) => ({
      id: membership.team.id,
      name: membership.team.name,
      role: membership.role,
      organizationId: membership.team.organizationId || undefined,
    })),
    ...ownedTeams.map((team) => ({
      id: team.id,
      name: team.name,
      role: "OWNER" as const,
      organizationId: team.organizationId || undefined,
    })),
  ];

  const userOrganizations = [
    ...organizationMemberships.map((membership) => ({
      id: membership.organization.id,
      name: membership.organization.name,
      role: membership.role,
    })),
    ...ownedOrganizations.map((org) => ({
      id: org.id,
      name: org.name,
      role: "OWNER" as const,
    })),
  ];

  const hasTeamAccess = userTeams.length > 0;
  const hasOrganizationAccess = userOrganizations.length > 0;
  const isTeamOwner = userTeams.some((team) => team.role === "OWNER");
  const isTeamManager = userTeams.some(
    (team) => team.role === "MANAGER" || team.role === "OWNER",
  );
  const isOrganizationOwner = userOrganizations.some(
    (org) => org.role === "OWNER",
  );
  const isOrganizationManager = userOrganizations.some(
    (org) => org.role === "MANAGER" || org.role === "OWNER",
  );

  return {
    hasTeamAccess,
    hasOrganizationAccess,
    isTeamOwner,
    isTeamManager,
    isOrganizationOwner,
    isOrganizationManager,
    userTeams,
    userOrganizations,
  };
}

export function canAccessTeam(permissions: UserPermissions): boolean {
  return permissions.hasTeamAccess;
}

export function canAccessOrganization(permissions: UserPermissions): boolean {
  return permissions.hasOrganizationAccess;
}

export function canManageTeam(permissions: UserPermissions): boolean {
  return permissions.isTeamManager;
}

export function canManageOrganization(permissions: UserPermissions): boolean {
  return permissions.isOrganizationManager;
}

// Helper function to get user's role in a specific organization
export function getUserRoleInOrganization(
  permissions: UserPermissions,
  organizationId: string,
): "OWNER" | "MANAGER" | "MEMBER" | null {
  const org = permissions.userOrganizations.find(
    (org) => org.id === organizationId,
  );
  return org ? org.role : null;
}

// Helper function to get user's role in a specific team
export function getUserRoleInTeam(
  permissions: UserPermissions,
  teamId: string,
): "OWNER" | "MANAGER" | "MEMBER" | null {
  const team = permissions.userTeams.find((team) => team.id === teamId);
  return team ? team.role : null;
}

// Helper function to check if user can access specific organization data
export function canAccessOrganizationData(
  permissions: UserPermissions,
  organizationId: string,
  requiredPermission: keyof RolePermissions,
): boolean {
  const userRole = getUserRoleInOrganization(permissions, organizationId);
  if (!userRole) return false;

  const rolePermissions = getRolePermissions(userRole);
  return rolePermissions[requiredPermission];
}

// Helper function to check if user can access specific team data
export function canAccessTeamData(
  permissions: UserPermissions,
  teamId: string,
  requiredPermission: keyof RolePermissions,
): boolean {
  const userRole = getUserRoleInTeam(permissions, teamId);
  if (!userRole) return false;

  const rolePermissions = getRolePermissions(userRole);
  return rolePermissions[requiredPermission];
}

// Helper function to check if user can manage a specific team
// This checks both team membership and organization membership
export async function canUserManageTeam(
  userId: string,
  teamId: string,
): Promise<{
  canManage: boolean;
  reason: "team_role" | "org_role" | "none";
  role?: "OWNER" | "MANAGER";
}> {
  // Get team details including organization
  const team = await db.team.findUnique({
    where: { id: teamId },
    include: {
      organization: {
        include: {
          members: {
            where: { userId },
          },
        },
      },
      members: {
        where: { userId },
      },
    },
  });

  if (!team) {
    return { canManage: false, reason: "none" };
  }

  // Check if user is team owner (in schema)
  if (team.ownerId === userId) {
    return { canManage: true, reason: "team_role", role: "OWNER" };
  }

  // Check direct team membership
  const teamMembership = team.members[0];
  if (
    teamMembership &&
    (teamMembership.role === "OWNER" || teamMembership.role === "MANAGER")
  ) {
    return { canManage: true, reason: "team_role", role: teamMembership.role };
  }

  // Check organization membership (if team belongs to organization)
  if (team.organization) {
    const orgMembership = team.organization.members[0];
    if (
      orgMembership &&
      (orgMembership.role === "OWNER" || orgMembership.role === "MANAGER")
    ) {
      return { canManage: true, reason: "org_role", role: orgMembership.role };
    }
  }

  return { canManage: false, reason: "none" };
}

// Helper function to get user's effective role in a team
// This considers both team membership and organization ownership
export function getUserEffectiveRoleInTeam(
  permissions: UserPermissions,
  teamId: string,
  organizationId?: string,
): "OWNER" | "MANAGER" | "MEMBER" | null {
  // First check direct team membership
  const teamRole = getUserRoleInTeam(permissions, teamId);
  if (teamRole) {
    return teamRole;
  }

  // If no direct team membership but team belongs to organization,
  // check organization role
  if (organizationId) {
    const orgRole = getUserRoleInOrganization(permissions, organizationId);
    if (orgRole === "OWNER" || orgRole === "MANAGER") {
      return orgRole; // Organization owners/managers can manage teams
    }
  }

  return null;
}
