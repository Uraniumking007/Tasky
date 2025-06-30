"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader as ModalHeader,
  DialogTitle as ModalTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Organization {
  id: string;
  name: string;
  userRole: "OWNER" | "MANAGER" | "MEMBER";
}

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  org: Organization;
  onSubmit: (orgId: string, newName: string) => void;
}

export default function EditOrganizationModal({
  isOpen,
  onClose,
  org,
  onSubmit,
}: EditOrganizationModalProps) {
  const [orgName, setOrgName] = useState(org.name);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(org.id, orgName);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent>
        <ModalHeader>
          <ModalTitle>Edit Organization</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            required
          />
          <DialogFooter>
            <Button type="submit">Save</Button>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
