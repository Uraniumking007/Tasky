"use client";
import { postTask } from "@/app/_server_actions/tasks";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { DatePicker } from "./date-picker";
import MultiInput from "./multi-input";

export function CreateTask() {
  const [date, setDate] = useState<Date>();
  const [task, setTask] = useState<string>();
  const [subTasks, setSubTasks] = useState<string[]>([]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Create</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>New Tasks</DialogTitle>
          <DialogDescription>create a useful tasks</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="task" className="text-right">
              Name
            </Label>
            <Input
              id="task"
              defaultValue={task}
              className="col-span-3"
              onChange={(e) => {
                setTask(e.target.value);
                console.log(e.target.value);
              }}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Due Date
            </Label>
            <DatePicker date={date} setDate={setDate} />
          </div>
          <MultiInput subTasks={subTasks} setSubTasks={setSubTasks} />
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                onClick={async (e) => {
                  const result = await postTask({
                    task,
                    dueDate: date?.toISOString(),
                    subTasks,
                  });
                  if (result.status === 200) {
                    setTask("");
                    setDate(undefined);
                    setSubTasks([]);
                    toast.success("Task created successfully");
                  }
                  if (result.status === 500 || result.status === 400) {
                    toast.error("Task not created");
                  }
                }}
              >
                Save changes
              </Button>
            </DialogClose>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
