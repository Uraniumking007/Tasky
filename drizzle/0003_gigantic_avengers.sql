CREATE SCHEMA "tasky";
--> statement-breakpoint
ALTER TABLE "taskList" RENAME TO "tasks";--> statement-breakpoint
ALTER TABLE "tasky"."tasks" RENAME COLUMN "date" TO "due_date";--> statement-breakpoint
ALTER TABLE "tasky"."tasks" RENAME COLUMN "subtasks" TO "sub_tasks";--> statement-breakpoint
ALTER TABLE "tasks" SET SCHEMA "tasky";
