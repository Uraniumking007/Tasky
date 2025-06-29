"use client";
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

export default function EditOrganizationModal({
  org,
  handlers,
}: {
  org: any;
  handlers: any;
}) {
  const open = handlers.editOrgId === org.id;
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) handlers.onCloseEditOrg();
      }}
    >
      <DialogContent>
        <ModalHeader>
          <ModalTitle>Edit Organization</ModalTitle>
        </ModalHeader>
        <form onSubmit={handlers.onEditOrgSubmit} className="space-y-4">
          <Input
            value={handlers.editOrgName}
            onChange={(e) => handlers.setEditOrgName(e.target.value)}
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
