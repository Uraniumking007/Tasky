"use server";
import { db } from "@/server";
import { tasks, tasksType } from "../../server/schema";

export async function postTask({ task, dueDate, subTasks }: tasksType) {
  const taskData = {
    task,
    dueDate,
    subTasks,
  };
  if (!taskData.task) {
    return { status: 400, message: "Task name is required" };
  }
  const data = await db.insert(tasks).values(taskData).returning();
  if (!data) {
    return { status: 500, message: "Task not created" };
  }
  return { data, status: 200, message: "Task created successfully" };
}

export async function getTasks() {
  const data = await db.select().from(tasks).execute();
  console.log(data);
  return "Hrllo";
}
