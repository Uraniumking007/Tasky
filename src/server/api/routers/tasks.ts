import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

// Helper function to get user from session
async function getUserFromSession(ctx: any) {
  const session = ctx.session;
  if (!session?.user?.email && !session?.user?.username) {
    throw new Error("No user session found");
  }

  const user = await ctx.db.users.findFirst({
    where: {
      OR: [{ email: session.user.email }, { username: session.user.username }],
    },
  });

  if (!user) {
    throw new Error("User not found in database");
  }

  return user;
}

export const tasksRouter = createTRPCRouter({
  // Get all tasks for user's active team
  getAllTasks: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserFromSession(ctx);

    const tasks = await ctx.db.task.findMany({
      where: {
        teamId: user.active_team,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return tasks;
  }),

  // Get all subtasks for the user
  getAllSubTasks: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserFromSession(ctx);

    const subTasks = await ctx.db.subTask.findMany({
      where: {
        user_id: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return subTasks;
  }),

  // Get task by ID
  getTaskById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);

      const task = await ctx.db.task.findUnique({
        where: {
          id: input.id,
          userId: user.id,
        },
      });

      return task;
    }),

  // Get subtasks by task ID
  getSubtasksById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);

      const subtasks = await ctx.db.subTask.findMany({
        where: {
          taskId: input.id,
          user_id: user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return subtasks;
    }),

  // Create new task with subtasks
  createTask: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, "Task title cannot be empty"),
        content: z.string().optional(),
        status: z.string(),
        priority: z.string(),
        subtasks: z
          .array(
            z.object({
              title: z.string().min(1, "Subtask title cannot be empty"),
              content: z.string().optional(),
              status: z.string(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);

      const task = await ctx.db.task.create({
        data: {
          title: input.title,
          content: input.content || "",
          status: input.status,
          priority: input.priority,
          userId: user.id,
          teamId: user.active_team,
        },
      });

      // Create subtasks if provided
      if (input.subtasks && input.subtasks.length > 0) {
        await ctx.db.subTask.createMany({
          data: input.subtasks.map((subtask) => ({
            title: subtask.title,
            content: subtask.content || "",
            status: subtask.status,
            taskId: task.id,
            user_id: user.id,
          })),
        });
      }

      return { success: true, message: "Task created successfully", task };
    }),

  // Update task
  updateTask: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Task title cannot be empty"),
        content: z.string().optional(),
        status: z.string(),
        priority: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);

      const task = await ctx.db.task.update({
        where: {
          id: input.id,
          userId: user.id,
        },
        data: {
          title: input.title,
          content: input.content,
          status: input.status,
          priority: input.priority,
        },
      });

      return { success: true, message: "Task updated successfully", task };
    }),

  // Update task status
  updateTaskStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);

      const task = await ctx.db.task.update({
        where: {
          id: input.id,
          userId: user.id,
        },
        data: {
          status: input.status,
        },
      });

      return { success: true, message: "Task status updated", task };
    }),

  // Delete task
  deleteTask: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);

      // Delete task (this will cascade delete subtasks)
      await ctx.db.task.delete({
        where: {
          id: input.id,
          userId: user.id,
        },
      });

      return { success: true, message: "Task deleted successfully" };
    }),

  // Add subtask
  addSubtask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        title: z.string().min(1, "Subtask title cannot be empty"),
        content: z.string().optional(),
        status: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);

      const subtask = await ctx.db.subTask.create({
        data: {
          title: input.title,
          content: input.content || "",
          status: input.status,
          taskId: input.taskId,
          user_id: user.id,
        },
      });

      return { success: true, message: "Subtask added successfully", subtask };
    }),

  // Update subtask
  updateSubtask: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1, "Subtask title cannot be empty"),
        content: z.string().optional(),
        status: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);

      const subtask = await ctx.db.subTask.update({
        where: {
          id: input.id,
          user_id: user.id,
        },
        data: {
          title: input.title,
          content: input.content,
          status: input.status,
        },
      });

      return {
        success: true,
        message: "Subtask updated successfully",
        subtask,
      };
    }),

  // Update subtask status
  updateSubtaskStatus: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);

      const subtask = await ctx.db.subTask.update({
        where: {
          id: input.id,
          user_id: user.id,
        },
        data: {
          status: input.status,
        },
      });

      return { success: true, message: "Subtask status updated", subtask };
    }),

  // Delete subtask
  deleteSubtask: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserFromSession(ctx);

      await ctx.db.subTask.delete({
        where: {
          id: input.id,
          user_id: user.id,
        },
      });

      return { success: true, message: "Subtask deleted successfully" };
    }),
});
