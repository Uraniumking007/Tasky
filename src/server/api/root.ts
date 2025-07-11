import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { teamInvitesRouter } from "./routers/team-invites";
import { organizationRouter } from "./routers/organization";
import { teamRouter } from "./routers/team";
import { workspaceRouter } from "./routers/workspace";
import { tasksRouter } from "./routers/tasks";
import { notesRouter } from "./routers/notes";
import { usersRouter } from "./routers/users";
import { settingsRouter } from "./routers/settings";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  teamInvites: teamInvitesRouter,
  organization: organizationRouter,
  team: teamRouter,
  workspace: workspaceRouter,
  tasks: tasksRouter,
  notes: notesRouter,
  users: usersRouter,
  settings: settingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
