import { useRouter } from "next/router";
import React from "react";

const TaskDetailedView = (props) => {
  console.log(props);
  const router = useRouter();
  const id = router.query.id;

  return (
    <>
      <h1>Jod</h1>
    </>
  );
};

export default TaskDetailedView;
