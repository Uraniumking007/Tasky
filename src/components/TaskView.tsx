import type { Tasks } from "@prisma/client";

function TasksView({ data }: { data: unknown[] }) {
  return (
    <div className="flex h-fit w-full flex-col items-center gap-5">
      {data?.map((task: Tasks) => {
        return (
          <div
            key={task.id}
            className="flex h-fit w-full flex-col items-center gap-5"
          >
            {task.Title}
          </div>
        );
      })}
    </div>
  );
}

export default TasksView;
