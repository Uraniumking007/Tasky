CREATE TABLE IF NOT EXISTS "taskss" (
	"id" serial PRIMARY KEY NOT NULL,
	"task" text NOT NULL,
	"completed" boolean DEFAULT false NOT NULL,
	"date" date NOT NULL,
	"subtasks" json DEFAULT '[]'::json NOT NULL
);
