ALTER TABLE "tasky"."tasks" RENAME COLUMN "task" TO "taskName";--> statement-breakpoint
ALTER TABLE "tasky"."tasks" RENAME COLUMN "date" TO "dueDate";--> statement-breakpoint
ALTER TABLE "tasky"."tasks" RENAME COLUMN "subtasks" TO "subTasks";--> statement-breakpoint
ALTER TABLE "tasky"."tasks" ALTER COLUMN "taskName" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "tasky"."tasks" ALTER COLUMN "dueDate" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tasky"."tasks" ALTER COLUMN "subTasks" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tasky"."tasks" ALTER COLUMN "subTasks" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "tasky"."tasks" DROP COLUMN IF EXISTS "completed";--> statement-breakpoint
ALTER TABLE "tasks" SET SCHEMA "tasky";
