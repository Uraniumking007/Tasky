"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Task } from "@prisma/client";
import { useRef } from "react";
import { deleteTask } from "@/app/(app)/tasks/action";
import { useToast } from "../ui/use-toast";
import { Trash2Icon } from "lucide-react";
import { DialogClose } from "@radix-ui/react-dialog";

export function DeleteTaskModal({ id }: { id: string }) {
  const { toast } = useToast();
  const ref = useRef<HTMLButtonElement>(null);

  async function handleSubmit() {
    if (id === "") {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Task Not Found",
      });
      return;
    }

    try {
      await deleteTask({ id });
      toast({
        variant: "default",
        title: "Success",
        description: "Task Edited successfully",
      });
    } catch (error) {
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: JSON.stringify(error),
        });
      }
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"destructive"}
          size={"icon"}
          className="rounded-full p-2"
        >
          <Trash2Icon size={32} />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Task</DialogTitle>
        </DialogHeader>

        <DialogFooter>
          <Button
            type="submit"
            onClick={async () => {
              await handleSubmit();
              ref.current?.click();
            }}
          >
            Delete Task
          </Button>
          <DialogClose ref={ref} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
