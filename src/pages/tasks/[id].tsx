import { useRouter } from "next/router";
import React from "react";

const EditTasksPage = () => {
  const router = useRouter();
  return <div>{router.query.id}</div>;
};

export default EditTasksPage;
