import React, { useContext } from "react";

import { Accordion, AccordionItem, Button } from "@nextui-org/react";
import type { Tasks } from "@prisma/client";
import { Edit2Icon, Trash2Icon } from "lucide-react";
import PriorityChip from "@/components/chips/priorityChip";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import toast from "react-hot-toast";
import SuccessToast from "../Toast/successToast";

export default function TasksAccordions({ tasks }: { tasks: Tasks[] }) {
  const router = useRouter();
  const [active, setActive] = React.useState<boolean>(false);
  const ctx = api.useContext();
  const { mutate, isLoading } = api.tasks.deleteTask.useMutation({
    onSuccess: () => {
      void ctx.tasks.invalidate();
      toast.custom((t) => (
        <SuccessToast t={t} message="Task Deleted Successfully" />
      ));
    },
  });

  function handleEdit(task: Tasks) {
    setActive(true);
    void router.push(`/tasks/${task.id}`);
    setActive(false);
  }

  function handleDelete(task: Tasks) {
    mutate({ id: task.id });
  }

  return (
    <Accordion>
      {tasks.map((task) => {
        return (
          <AccordionItem
            key={task.id}
            aria-label={`Tasks ${task.id}`}
            title={task.Title}
          >
            <div className="flex w-full flex-col">
              <p>{task.Description}</p>
              <div className="flex items-center justify-between">
                <div>
                  <PriorityChip title={task.Priority} />
                </div>
                <div>
                  <Button
                    radius="full"
                    className="w-fit min-w-fit p-0 px-3 py-2"
                    onClick={() => handleEdit(task)}
                    disabled={active}
                  >
                    <Edit2Icon size={"15px"} />
                  </Button>
                  <Button
                    radius="full"
                    className="w-fit min-w-fit p-0 px-3 py-2"
                    onClick={() => handleDelete(task)}
                    disabled={isLoading}
                  >
                    <Trash2Icon size={"15px"} />
                  </Button>
                </div>
              </div>
            </div>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
