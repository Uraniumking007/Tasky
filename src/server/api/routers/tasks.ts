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
import type { Tasks } from "@prisma/client";

export const TaskRouter = createTRPCRouter({
  createTasky: protectedProcedure
    .input(
      z.object({
        title: z.string().trim().nonempty("Title cannot be empty"),
        description: z.string().nullable(),
        categories: z
          .array(z.object({ value: z.string(), label: z.string() }))
          .default([]),
        priority: z.string().default("No Priority"),
        date: z.date(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const task: Tasks = await prisma.tasks.create({
        data: {
          Title: input.title,
          Description: input.description,
          Categories: input.categories,
          isComplete: false,
          Priority: input.priority,
          UserId: ctx.session.user.id,
          Deadline: input.date,
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
