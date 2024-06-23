import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const postRouter = createTRPCRouter({
  // hello: publicProcedure
  //   .input(z.object({ text: z.string() }))
  //   .query(({ input }) => {
  //     return {
  //       greeting: `Hello ${input.text}`,
  //     };
  //   }),
  // create: protectedProcedure
  //   .input(z.object({ name: z.string().min(1) }))
  //   .mutation(async ({ ctx, input }) => {
  //     // simulate a slow db call
  //     await new Promise((resolve) => setTimeout(resolve, 1000));
  //   }),
  // getAllTasksClient: protectedProcedure.query(async ({ ctx }) => {
  //   const user = await ctx.db.user.findUnique({
  //     where: { username: ctx.session.user.username },
  //   });
  //   return ctx.db.task.findFirst({
  //     orderBy: { createdAt: "desc" },
  //     where: { userId: user?.id },
  //   });
  // }),
  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
