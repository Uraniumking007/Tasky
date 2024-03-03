ALTER TABLE "tasky"."tasks" RENAME COLUMN "due_date" TO "date";--> statement-breakpoint
ALTER TABLE "tasky"."tasks" RENAME COLUMN "sub_tasks" TO "subtasks";--> statement-breakpoint
ALTER TABLE "tasky"."tasks" SET SCHEMA public;
--> statement-breakpoint
DROP SCHEMA "tasky";
