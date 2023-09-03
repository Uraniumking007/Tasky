import type { Tasks } from "@prisma/client";

function TasksView({ data }: { data: Tasks[] }) {
  return (
    <div className="flex h-fit w-full flex-col gap-5 pl-16">
      {data?.map((task: Tasks) => {
        return (
          <div key={task.id} className="flex flex-col gap-1">
            <div className="link-primary link text-lg hover:link-hover">
              {task.Title}
            </div>
            <div className="link-primary link text-sm hover:link-hover">
              {task?.Description}
            </div>
            <div className="badge badge-primary badge-outline">
              {task.Priority}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default TasksView;
