import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { prisma } from "@/server/db";
import type { Tasks } from "@prisma/client";
import { TRPCError } from "@trpc/server";

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
        date: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await prisma.tasks.create({
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
      return {
        status: "success",
        message: "Task created successfully",
        data: input,
        code: 200,
        error: null,
      };
    }),
  deleteTask: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const task = await prisma.tasks.findFirst({
        where: {
          id: input.id,
        },
      });

      if (!task)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });

      if (task.UserId !== ctx.session.user.id)
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You are not authorized to delete this task",
        });

      const data = await prisma.tasks.delete({
        where: {
          id: input.id,
          UserId: ctx.session.user.id,
        },
      });

      return {
        status: "success",
        message: "Task deleted successfully",
        code: 200,
        data,
      };
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const tasks: Tasks[] = await prisma.tasks.findMany({
      where: {
        UserId: ctx.session.user.id,
      },
      orderBy: {
        CreatedAt: "desc",
      },
    });

    if (tasks.length === 0)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No tasks found",
      });

    return tasks;
  }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async (input) => {
      const task: Tasks | null = await prisma.tasks.findFirst({
        where: {
          id: input.id,
        },
      });
      return task;
    }),
});
