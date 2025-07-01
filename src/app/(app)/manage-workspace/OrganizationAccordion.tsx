"use client";
import OrganizationCard from "./OrganizationCard";

interface Team {
  id: string;
  name: string;
  members: Array<{
    user: { name?: string; email: string | null; username?: string };
  }>;
}

interface Organization {
  id: string;
  name: string;
  userRole: string;
  teams: Team[];
  members: Array<{
    user: { name?: string; email: string | null; username?: string };
  }>;
}

interface OrganizationAccordionProps {
  organizations: Organization[];
  user: { name?: string; email: string | null; username?: string };
  handlers: {
    handleEditOrganization: (org: Organization) => void;
    handleDeleteOrganization: (org: Organization) => void;
  };
}

export default function OrganizationAccordion({
  organizations,
  user,
  handlers,
}: OrganizationAccordionProps) {
  if (organizations.length === 0) {
    return (
      <div className="text-muted-foreground">
        You do not own any organizations.
      </div>
    );
  }
  return (
    <div className="w-full max-w-3xl space-y-4">
      {organizations.map((org) => (
        <OrganizationCard
          key={org.id}
          org={org as any}
          user={user as any}
          handlers={handlers as any}
        />
      ))}
    </div>
  );
}
