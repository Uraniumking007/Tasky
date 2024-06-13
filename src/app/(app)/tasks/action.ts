"use server";

import { getServerAuthSession } from "@/server/auth";
import { db } from "@/server/db";
import { Task } from "@prisma/client";

export interface TaskData {
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

    const task = await db.task.create({
      data: {
        ...taskData,
        userId: user.id,
        teamId: user.active_team,
      },
    });
    return task;
  } catch (error) {
    console.error(error);
    return JSON.stringify(error);
  }
}
