import { exampleRouter } from "@/server/api/routers/example";
import { createTRPCRouter } from "@/server/api/trpc";
import { TaskRouter } from "./routers/tasks";

export const appRouter = createTRPCRouter({
  example: exampleRouter,
  tasks: TaskRouter,
});

export type AppRouter = typeof appRouter;
