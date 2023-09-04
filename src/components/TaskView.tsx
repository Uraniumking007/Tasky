import type { Tasks } from "@prisma/client";
import { Edit, Trash2 } from "lucide-react";
import CircularButton from "./Button/circularButton";

function TasksView({ data }: { data: Tasks[] }) {
  return (
    <div className="flex h-fit w-full flex-col gap-5 pl-16">
      {data?.map((task: Tasks) => {
        return (
          <div key={task.id} className="flex justify-between gap-1">
            <div className="flex flex-col gap-1">
              <div className="link-primary link text-xl font-bold hover:link-hover">
                {task.Title}
              </div>
              <div className="text-sm hover:link-hover">
                {task?.Description}
              </div>
              <div className="badge badge-primary badge-outline badge-xs mt-2 p-2">
                {task.Priority}
              </div>
            </div>
            <div className="flex gap-2">
              <CircularButton>
                <Edit className="text-secondary-content" />
              </CircularButton>
              <CircularButton>
                <Trash2 className="text-secondary-content" />
              </CircularButton>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TasksView;
