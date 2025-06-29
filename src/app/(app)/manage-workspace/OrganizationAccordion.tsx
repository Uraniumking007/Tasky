"use client";
import OrganizationCard from "./OrganizationCard";

export default function OrganizationAccordion({
  organizations,
  user,
  handlers,
}: {
  organizations: any[];
  user: any;
  handlers: any;
}) {
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
          org={org}
          user={user}
          handlers={handlers}
        />
      ))}
    </div>
  );
}
