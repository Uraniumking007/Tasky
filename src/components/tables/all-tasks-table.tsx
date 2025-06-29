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
import { api } from "@/trpc/react";
import { useToast } from "../ui/use-toast";

export default function AllTasksListTable({
  tasks,
  subtasks,
}: {
  tasks: Task[];
  subtasks: SubTask[];
}) {
  const { toast } = useToast();
  const utils = api.useUtils();

  const updateTaskStatusMutation = api.tasks.updateTaskStatus.useMutation({
    onSuccess: (data) => {
      toast({
        variant: "default",
        description: data.message,
      });
      // Invalidate and refetch tasks
      utils.tasks.getAllTasks.invalidate();
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        description: error.message || "Failed to update task status",
      });
    },
  });

  async function changeTaskStatusClient({
    id,
    status,
  }: {
    id: string;
    status: string;
  }) {
    updateTaskStatusMutation.mutate({
      id,
      status,
    });
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
