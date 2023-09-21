import React from "react";

import { Accordion, AccordionItem } from "@nextui-org/react";
import { Tasks } from "@prisma/client";

export default function TasksAccordions({ tasks }: { tasks: Tasks[] }) {
  return (
    <Accordion>
      {tasks.map((task) => {
        return (
          <AccordionItem
            key={task.id}
            aria-label={`Tasks ${task.id}`}
            title={task.Title}
          >
            <p>{task.Description}</p>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
