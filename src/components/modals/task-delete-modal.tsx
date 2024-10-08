"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
      <DialogContent className="flex flex-col sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex justify-center">Delete Task</DialogTitle>
        </DialogHeader>
        <div className="flex w-full justify-evenly gap-2">
          <Button type="reset" variant={"secondary"}>
            <DialogClose ref={ref}>Cancel </DialogClose>
          </Button>
          <Button
            type="submit"
            variant={"destructive"}
            onClick={async () => {
              await handleSubmit();
              ref.current?.click();
            }}
          >
            Delete Task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
