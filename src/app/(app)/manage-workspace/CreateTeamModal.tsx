"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader as ModalHeader,
  DialogTitle as ModalTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Users } from "lucide-react";

export default function CreateTeamModal({
  orgId,
  handlers,
}: {
  orgId: string;
  handlers: any;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="secondary"
          className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-secondary to-primary/20 px-6 py-3 shadow-lg hover:from-secondary/80 hover:to-primary/10"
        >
          <Users className="h-5 w-5" />
          Create Team
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-none bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:bg-background/80">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-2xl font-bold">
            <Users className="h-6 w-6 text-primary" />
            Create Team
          </ModalTitle>
        </ModalHeader>
        <form
          onSubmit={(e) => handlers.onCreateTeam(e, orgId)}
          className="mt-4 space-y-6"
        >
          <div className="relative">
            <Label htmlFor={`teamName-${orgId}`} className="mb-1 block">
              Team Name
            </Label>
            <Input
              id={`teamName-${orgId}`}
              name="teamName"
              placeholder="Team Name"
              required
              className="rounded-lg border border-primary/20 bg-white/60 py-3 pl-10 shadow-inner focus:ring-2 focus:ring-primary/40 dark:bg-background/60"
            />
            <Users className="absolute left-3 top-9 h-5 w-5 -translate-y-1/2 text-primary/60" />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg bg-gradient-to-r from-secondary to-primary/40 py-3 font-semibold hover:from-secondary/80 hover:to-primary/20"
            >
              <Sparkles className="h-5 w-5" />
              Create
            </Button>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full rounded-lg py-3"
              >
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
