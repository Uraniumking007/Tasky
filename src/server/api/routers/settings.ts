import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  getUserSettings,
  saveUserSettings,
  clearSettingsCookies,
} from "@/lib/settings";
import type { Session } from "next-auth";
import type { PrismaClient } from "@prisma/client";

// Helper function to get user from session
async function getUserFromSession(ctx: { session: Session; db: PrismaClient }) {
  if (!ctx.session.user.email && !ctx.session.user.username) {
    throw new Error("No email or username in session");
  }

  const user = await ctx.db.users.findFirst({
    where: {
      OR: [
        { email: ctx.session.user.email },
        { username: ctx.session.user.username },
      ],
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  return user;
}

export const settingsRouter = createTRPCRouter({
  // Get user settings
  getUserSettings: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserFromSession(ctx);
    return await getUserSettings(user.id);
  }),

  // Save user settings
  saveUserSettings: protectedProcedure
    .input(
      z.object({
        // Appearance settings
        theme: z.enum(["light", "dark", "system"]).optional(),
        compactMode: z.boolean().optional(),
        showAnimations: z.boolean().optional(),

        // Dashboard settings
        defaultView: z.enum(["list", "board", "calendar"]).optional(),
        showRecentTasks: z.boolean().optional(),
        showTeamActivity: z.boolean().optional(),
        showQuickActions: z.boolean().optional(),
        tasksPerPage: z.number().min(1).max(100).optional(),

        // Notification preferences
        emailNotifications: z.boolean().optional(),
        pushNotifications: z.boolean().optional(),
        taskReminders: z.boolean().optional(),
        weeklyDigest: z.boolean().optional(),

        // General preferences
        autoSave: z.boolean().optional(),
        showCompletedTasks: z.boolean().optional(),

        // Cookie preferences
        allowCookies: z.boolean().optional(),
        allowCachedData: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.log("Settings router - Received input:", input);
      const user = await getUserFromSession(ctx);
      console.log("Settings router - User ID:", user.id);
      await saveUserSettings(user.id, input);
      console.log("Settings router - Settings saved successfully");
      return { success: true };
    }),

  // Clear settings cookies (for logout)
  clearSettingsCookies: protectedProcedure.mutation(async () => {
    await clearSettingsCookies();
    return { success: true };
  }),
});
