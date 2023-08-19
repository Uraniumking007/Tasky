/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { prisma } from "@/server/db";
import { Tasks } from "@prisma/client";

export const TaskRouter = createTRPCRouter({
  createTasky: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().nullable(),
        categories: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const task: Tasks = await prisma.tasks.create({
        data: {
          Title: input.title,
          Description: input.description,
          Categories: input.categories,
          isComplete: false,
          UserId: ctx.session.user.id,
        },
      });

      console.log(task);

      const tasks: Tasks[] = await prisma.tasks.findMany();

      return tasks;
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const tasks: Tasks[] = await prisma.tasks.findMany({
      where: {
        UserId: ctx.session.user.id,
      },
    });

    return tasks;
  }),
});
