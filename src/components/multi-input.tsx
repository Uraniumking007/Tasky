"use client";
import { Dispatch, SetStateAction, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { PlusCircleIcon, PlusIcon } from "lucide-react";

export default function MultiInput({
  subTasks,
  setSubTasks,
}: {
  subTasks: string[];
  setSubTasks: Dispatch<SetStateAction<string[]>>;
}) {
  const [subTask, setSubTask] = useState<string>();
  const [displayInput, setDisplayInput] = useState<boolean>(false);
  return (
    <div
      onSubmit={() => {
        if (subTask) {
          setSubTasks([...subTasks, subTask]);
        }
      }}
      className="grid grid-cols-4 items-center gap-4"
    >
      {subTasks.map((subTask, index) => (
        <>
          <Label htmlFor="task" className="text-right">
            {index === 0 ? "Sub Task" : ""}
          </Label>
          <p className="col-span-3">{subTask}</p>
        </>
      ))}
      <>
        <Label htmlFor="multi-input" className="text-right">
          {subTasks.length > 0 ? "Add More" : "Sub Task"}
        </Label>

        {displayInput && (
          <>
            <Input
              id="task"
              className="col-span-2"
              value={subTask}
              onChange={(e) => {
                setSubTask(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key !== "Enter" || !subTask) {
                  return;
                }
                setSubTasks([...subTasks, subTask]);
                setSubTask("");
              }}
            />
            <PlusCircleIcon
              className="h-4 w-4 col-span-1"
              onClick={() => {
                if (!subTask) {
                  return;
                }
                setSubTasks([...subTasks, subTask]);
                setSubTask("");
                setDisplayInput(!displayInput);
              }}
            />
          </>
        )}
        {!displayInput && (
          <p
            className="flex h-10 w-full rounded-md items-center cursor-default bg-background px-3 py-2 text-sm  file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground     disabled:cursor-not-allowed disabled:opacity-50 col-span-3"
            onClick={() => {
              setDisplayInput(!displayInput);
            }}
          >
            Add Sub Task <PlusIcon className="h-4 w-4" />
          </p>
        )}
      </>
    </div>
  );
}
