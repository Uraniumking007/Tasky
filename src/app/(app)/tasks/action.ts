"use server";

import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import type { SubTask, Task } from "@prisma/client";
import type { Session } from "next-auth";
import { revalidatePath } from "next/cache";

export interface TaskData extends Task {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  status: string;
}

async function getUser(session: Session | null) {
  if (!session) throw new Error("No session found");
  const user = await db.user.findUnique({
    where: {
      username: session.user.username,
    },
  });
  if (!user) throw new Error("User not found");
  return user;
}

export async function createNewTask({
  taskData,
  subtasks,
}: {
  taskData: TaskData;
  subtasks: Partial<Task>[];
}) {
  const session = await getServerAuthSession();
  try {
    const user = await getUser(session);
    const { id, ...taskDataWithoutId } = taskData;

    if (!taskDataWithoutId.title || taskDataWithoutId.title == "") {
      throw new Error("Task title cannot be empty");
    }

    const task = await db.task.create({
      data: {
        ...taskDataWithoutId,
        userId: user.id,
        teamId: user.active_team,
      },
    });
    for (const subtask of subtasks) {
      if (!subtask.title || subtask.title == "") {
        throw new Error("Subtask title cannot be empty");
      }
      await db.subTask.create({
        data: {
          title: subtask.title,
          content: subtask.content,
          status: subtask.status,
          taskId: task.id,
          user_id: user.id,
        },
      });
    }
    revalidatePath("/app/tasks");
    return task;
  } catch (error) {
    console.error(error);
    return JSON.stringify(error);
  }
}

export async function addSubtask({
  subtask,
  taskId,
}: {
  subtask: SubTask;
  taskId: string;
}) {
  const session = await getServerAuthSession();

  try {
    const user = await getUser(session);

    if (!subtask.title || subtask.title == "") {
      throw new Error("Subtask title cannot be empty");
    }

    const { id, taskId, ...subtaskWithoutIds } = subtask;

    await db.subTask.create({
      data: {
        ...subtaskWithoutIds,
        taskId,
        user_id: user.id,
      },
    });
    revalidatePath("/app/tasks");
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

  const user = await getUser(session);

  const data = await db.task.findMany({
    where: {
      teamId: user.active_team,
    },
  });
  return {
    data,
  };
}

export async function getAllSubTasks() {
  const session = await getServerAuthSession();

  if (!session) {
    throw new Error("No session found");
  }
  const user = await getUser(session);

  const data = await db.subTask.findMany({
    where: {
      user_id: user.id,
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

  const user = await getUser(session);

  return await db.task.findUnique({
    where: {
      id,
      userId: user.id,
    },
  });
}

export default async function getSubtasksById({ id }: { id: string }) {
  const session = await getServerAuthSession();

  if (!session) {
    throw new Error("No session found");
  }

  const user = await getUser(session);

  return await db.subTask.findMany({
    where: {
      taskId: id,
      user_id: user.id,
    },
  });
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
    const user = await getUser(session);

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

export async function updateSubtask({
  id,
  subtask,
}: {
  id: string;
  subtask: SubTask;
}) {
  const session = await getServerAuthSession();

  if (!session) {
    throw new Error("No session found");
  }

  try {
    const user = await getUser(session);

    const subTask = await db.subTask.update({
      where: {
        id,
        user_id: user.id,
      },
      data: {
        ...subtask,
      },
    });
    revalidatePath("/app/tasks");
    return subTask;
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

  try {
    const user = await getUser(session);

    const task = await db.task.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    revalidatePath("/app/tasks");

    return task;
  } catch (error) {
    console.error(error);
    return JSON.stringify(error);
  }
}

export async function deleteSubtask({ id }: { id: string }) {
  const session = await getServerAuthSession();

  if (!session) {
    throw new Error("No session found");
  }

  try {
    const user = await getUser(session);

    const subtask = await db.subTask.delete({
      where: {
        id,
        user_id: user.id,
      },
    });

    revalidatePath("/app/tasks");

    return subtask;
  } catch (error) {
    console.error(error);
    return JSON.stringify(error);
  }
}

export async function updateTaskStatus({
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

  const user = await getUser(session);

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

export async function updateSubtaskStatus({
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

  const user = await getUser(session);

  const subTask = await db.subTask.update({
    where: {
      id,
      user_id: user.id,
    },
    data: {
      status,
    },
  });

  return {
    statusCode: 200,
    data: subTask,
    message: "Task Updated",
  };
}
