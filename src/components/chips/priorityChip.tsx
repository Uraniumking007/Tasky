import React from "react";

import { Chip } from "@nextui-org/react";
import { title } from "process";

function PriorityChip({ title }: { title: string }) {
  if (title === "High Priority")
    return (
      <Chip color="danger" size="sm">
        {title}
      </Chip>
    );
  if (title === "Medium Priority")
    return (
      <Chip color="warning" size="sm">
        {title}
      </Chip>
    );
  if (title === "Low Priority")
    return (
      <Chip color="success" size="sm">
        {title}
      </Chip>
    );

  return (
    <Chip color="default" size="sm">
      {title}
    </Chip>
  );
}

export default PriorityChip;
