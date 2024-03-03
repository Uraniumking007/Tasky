CREATE SCHEMA "tasky";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tasky"."tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"task" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"due_date" date NOT NULL,
	"sub_tasks" json DEFAULT '[]'::json NOT NULL
);
