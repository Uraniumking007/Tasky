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

export default function EditTeamModal({ handlers }: { handlers: any }) {
  const open = handlers.editTeamId !== null;
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) handlers.onCloseEditTeam();
      }}
    >
      <DialogContent>
        <ModalHeader>
          <ModalTitle>Edit Team</ModalTitle>
        </ModalHeader>
        <form onSubmit={handlers.onEditTeamSubmit} className="space-y-4">
          <Input
            value={handlers.editTeamName}
            onChange={(e) => handlers.setEditTeamName(e.target.value)}
            placeholder="Team name"
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
