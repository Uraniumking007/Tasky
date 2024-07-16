import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SubTask, Task } from "@prisma/client";

export default function AllTasksListTable({
  tasks,
  subtasks,
}: {
  tasks: Task[];
  subtasks: SubTask[];
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
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
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell>
                {subtaskCount !== 0 ? `+${subtaskCount}` : "-"}
              </TableCell>
              <TableCell className="capitalize">{task.status}</TableCell>
              <TableCell>{task.status}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
