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
import { Sparkles, Building2 } from "lucide-react";

interface CreateOrganizationModalProps {
  handlers: {
    onCreateOrg: (e: React.FormEvent<HTMLFormElement>) => void;
  };
}

export default function CreateOrganizationModal({
  handlers,
}: CreateOrganizationModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 px-6 py-3 shadow-lg hover:from-primary/80 hover:to-primary/60"
        >
          <Building2 className="h-5 w-5" />
          Create Organization
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-2xl border-none bg-white/80 p-8 shadow-2xl backdrop-blur-xl dark:bg-background/80">
        <ModalHeader>
          <ModalTitle className="flex items-center gap-2 text-2xl font-bold">
            <Building2 className="h-6 w-6 text-primary" />
            Create Organization
          </ModalTitle>
        </ModalHeader>
        <form onSubmit={handlers.onCreateOrg} className="mt-4 space-y-6">
          <div className="relative">
            <Label htmlFor="orgName" className="mb-1 block">
              Organization Name
            </Label>
            <Input
              id="orgName"
              name="orgName"
              placeholder="Organization Name"
              required
              className="rounded-lg border border-primary/20 bg-white/60 py-3 pl-10 shadow-inner focus:ring-2 focus:ring-primary/40 dark:bg-background/60"
            />
            <Building2 className="absolute left-3 top-9 h-5 w-5 -translate-y-1/2 text-primary/60" />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="flex w-full items-center gap-2 rounded-lg bg-gradient-to-r from-primary to-primary/80 py-3 font-semibold hover:from-primary/80 hover:to-primary/60"
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
