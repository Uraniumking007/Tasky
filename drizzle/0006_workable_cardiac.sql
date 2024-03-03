ALTER TABLE "tasky"."tasks" RENAME COLUMN "taskName" TO "task";--> statement-breakpoint
ALTER TABLE "tasky"."tasks" RENAME COLUMN "dueDate" TO "due-date";--> statement-breakpoint
ALTER TABLE "tasky"."tasks" RENAME COLUMN "subTasks" TO "sub-tasks";--> statement-breakpoint
ALTER TABLE "tasky"."tasks" ALTER COLUMN "task" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tasky"."tasks" SET SCHEMA public;
