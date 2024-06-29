"use server";

import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { Task } from "@prisma/client";
import { revalidatePath } from "next/cache";

export interface TaskData extends Task {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  status: string;
}

export async function createTask({ taskData }: { taskData: TaskData }) {
  const session = await getServerAuthSession();
  try {
    if (!session) throw new Error("No session found");
    const user = await db.user.findUnique({
      where: {
        username: session.user.username,
      },
    });

    if (!user) throw new Error("User not found");

    const { id, ...taskDataWithoutId } = taskData;

    const task = await db.task.create({
      data: {
        ...taskDataWithoutId,
        userId: user.id,
        teamId: user.active_team,
      },
    });
    revalidatePath("/app/tasks");
    return task;
  } catch (error) {
    console.error(error);
    return JSON.stringify(error);
  }
}

export async function getAllTasks() {
  const session = await getServerAuthSession();

  if (!session) {
    throw new Error("No session found");
  }

  const user = await db.user.findUnique({
    where: {
      username: session.user.username,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const data = await db.task.findMany({
    where: {
      teamId: user.active_team,
    },
  });
  return {
    data,
  };
}

export async function getTaskById({ id }: { id: string }) {
  const session = await getServerAuthSession();

  if (!session) {
    throw new Error("No session found");
  }

  const user = await db.user.findUnique({
    where: {
      username: session.user.username,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const task = await db.task.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });

  return task;
}

export async function updateTask({
  id,
  taskData,
}: {
  id: string;
  taskData: TaskData;
}) {
  const session = await getServerAuthSession();

  if (!session) {
    throw new Error("No session found");
  }

  try {
    const user = await db.user.findUnique({
      where: {
        username: session.user.username,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const task = await db.task.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        ...taskData,
      },
    });
    revalidatePath("/app/tasks");
    return task;
  } catch (error) {
    console.error(error);
    return JSON.stringify(error);
  }
}

export async function deleteTask({ id }: { id: string }) {
  const session = await getServerAuthSession();

  if (!session) {
    throw new Error("No session found");
  }

  const user = await db.user.findUnique({
    where: {
      username: session.user.username,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const task = await db.task.delete({
    where: {
      id,
      userId: user.id,
    },
  });

  return task;
}

export async function changeTaskStatus({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const session = await getServerAuthSession();

  if (!session) {
    throw new Error("No session found");
  }

  const user = await db.user.findUnique({
    where: {
      username: session.user.username,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const task = await db.task.update({
    where: {
      id,
      userId: user.id,
    },
    data: {
      status,
    },
  });

  return {
    statusCode: 200,
    data: task,
    message: "Task Updated",
  };
}