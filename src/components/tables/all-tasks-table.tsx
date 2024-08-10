"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SubTask, Task } from "@prisma/client";
import { Checkbox } from "../ui/checkbox";
import { updateTaskStatus } from "@/app/(app)/tasks/action";
import { useToast } from "../ui/use-toast";

export default function AllTasksListTable({
  tasks,
  subtasks,
}: {
  tasks: Task[];
  subtasks: SubTask[];
}) {
  const { toast } = useToast();

  async function changeTaskStatusClient({
    id,
    status,
  }: {
    id: string;
    status: string;
  }) {
    const result = await updateTaskStatus({
      id,
      status,
    });
    if (result.statusCode === 200) {
      toast({
        variant: "default",
        description: "Task status updated",
      });
    } else {
      toast({
        variant: "destructive",
        description: "Failed to update task status",
      });
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <Checkbox />
          </TableHead>
          <TableHead>Task</TableHead>
          <TableHead>Sub Tasks</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Priority</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const subtask = subtasks.filter(
            (subtask) => subtask.taskId === task.id,
          );
          const subtaskCount = subtask.length;
          return (
            <TableRow key={task.id}>
              <TableCell>
                <Checkbox
                  defaultChecked={task.status === "completed"}
                  onCheckedChange={async (e) => {
                    await changeTaskStatusClient({
                      id: task.id,
                      status: e ? "completed" : "pending",
                    });
                  }}
                />
              </TableCell>
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                {subtaskCount === 0 ? "-" : `+${subtaskCount}`}
              </TableCell>
              <TableCell className="capitalize">{task.status}</TableCell>
              <TableCell className="capitalize">
                {task.priority.replace("-", " ")}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
