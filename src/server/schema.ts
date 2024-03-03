import {
  date,
  json,
  pgSchema,
  pgTable,
  pgTableCreator,
  serial,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { db } from ".";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  task: varchar("task"),
  dueDate: date("due-date"),
  subTasks: json("sub-tasks"),
});

export type tasksType = typeof tasks.$inferInsert;
