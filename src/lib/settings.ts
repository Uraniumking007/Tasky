import { cookies } from "next/headers";
import { encrypt, decrypt } from "./crypto";
import { db } from "@/server/db";

export interface UserSettingsData {
  // Appearance settings
  theme: "light" | "dark" | "system";
  compactMode: boolean;
  showAnimations: boolean;

  // Dashboard settings
  defaultView: "list" | "board" | "calendar";
  showRecentTasks: boolean;
  showTeamActivity: boolean;
  showQuickActions: boolean;
  tasksPerPage: number;

  // Notification preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  weeklyDigest: boolean;

  // General preferences
  autoSave: boolean;
  showCompletedTasks: boolean;

  // Cookie preferences
  allowCookies: boolean;
  allowCachedData: boolean;
}

export const DEFAULT_SETTINGS: UserSettingsData = {
  // Appearance settings
  theme: "system",
  compactMode: false,
  showAnimations: true,

  // Dashboard settings
  defaultView: "list",
  showRecentTasks: true,
  showTeamActivity: true,
  showQuickActions: true,
  tasksPerPage: 10,

  // Notification preferences
  emailNotifications: true,
  pushNotifications: false,
  taskReminders: true,
  weeklyDigest: false,

  // General preferences
  autoSave: true,
  showCompletedTasks: false,

  // Cookie preferences
  allowCookies: true,
  allowCachedData: true,
};

const SETTINGS_COOKIE_NAME = "tasky-settings";
const SETTINGS_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export class SettingsManager {
  private userId: string;
  private allowCookies: boolean;

  constructor(userId: string, allowCookies: boolean = true) {
    this.userId = userId;
    this.allowCookies = allowCookies;
  }

  /**
   * Get user settings with fallback: Database -> Cookies -> Defaults
   */
  async getUserSettings(): Promise<UserSettingsData> {
    try {
      console.log("SettingsManager - Getting settings for user:", this.userId);
      // First, try to get from database
      const dbSettings = await this.getSettingsFromDatabase();
      console.log("SettingsManager - Database settings:", dbSettings);
      if (dbSettings) {
        // If we have database settings, also update cookies for faster access
        if (this.allowCookies) {
          try {
            await this.saveSettingsToCookies(dbSettings);
          } catch (error) {
            console.warn("Failed to sync settings to cookies:", error);
          }
        }
        return dbSettings;
      }

      // If no database settings, try cookies
      if (this.allowCookies) {
        const cookieSettings = await this.getSettingsFromCookies();
        console.log("SettingsManager - Cookie settings:", cookieSettings);
        if (cookieSettings) {
          // Sync cookie settings to database
          try {
            await this.saveSettingsToDatabase(cookieSettings);
          } catch (error) {
            console.warn("Failed to sync settings to database:", error);
          }
          return cookieSettings;
        }
      }

      // Return default settings
      console.log("SettingsManager - Using default settings");
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error("Error getting user settings:", error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save settings to both database and cookies
   */
  async saveUserSettings(settings: Partial<UserSettingsData>): Promise<void> {
    try {
      console.log("SettingsManager - Saving settings:", settings);
      // Get current settings
      const currentSettings = await this.getUserSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      console.log("SettingsManager - Updated settings:", updatedSettings);

      // Save to database first
      await this.saveSettingsToDatabase(updatedSettings);
      console.log("SettingsManager - Settings saved to database");

      // Then save to cookies if allowed
      if (this.allowCookies) {
        try {
          await this.saveSettingsToCookies(updatedSettings);
          console.log("SettingsManager - Settings saved to cookies");
        } catch (error) {
          console.warn("Failed to save settings to cookies:", error);
        }
      }
    } catch (error) {
      console.error("Error saving user settings:", error);
      throw error;
    }
  }

  /**
   * Get settings from database
   */
  private async getSettingsFromDatabase(): Promise<UserSettingsData | null> {
    try {
      const dbSettings = await db.userSettings.findUnique({
        where: { userId: this.userId },
      });

      if (!dbSettings) return null;

      // Convert database format to UserSettingsData format
      return {
        theme: dbSettings.theme as "light" | "dark" | "system",
        compactMode: dbSettings.compactMode,
        showAnimations: dbSettings.showAnimations,
        defaultView: dbSettings.defaultView as "list" | "board" | "calendar",
        showRecentTasks: dbSettings.showRecentTasks,
        showTeamActivity: dbSettings.showTeamActivity,
        showQuickActions: dbSettings.showQuickActions,
        tasksPerPage: dbSettings.tasksPerPage,
        emailNotifications: dbSettings.emailNotifications,
        pushNotifications: dbSettings.pushNotifications,
        taskReminders: dbSettings.taskReminders,
        weeklyDigest: dbSettings.weeklyDigest,
        autoSave: dbSettings.autoSave,
        showCompletedTasks: dbSettings.showCompletedTasks,
        allowCookies: dbSettings.allowCookies,
        allowCachedData: dbSettings.allowCachedData,
      };
    } catch (error) {
      console.error("Error getting settings from database:", error);
      return null;
    }
  }

  /**
   * Save settings to database
   */
  private async saveSettingsToDatabase(
    settings: UserSettingsData,
  ): Promise<void> {
    try {
      console.log(
        "SettingsManager - Saving to database for user:",
        this.userId,
      );
      const result = await db.userSettings.upsert({
        where: { userId: this.userId },
        update: {
          theme: settings.theme,
          compactMode: settings.compactMode,
          showAnimations: settings.showAnimations,
          defaultView: settings.defaultView,
          showRecentTasks: settings.showRecentTasks,
          showTeamActivity: settings.showTeamActivity,
          showQuickActions: settings.showQuickActions,
          tasksPerPage: settings.tasksPerPage,
          emailNotifications: settings.emailNotifications,
          pushNotifications: settings.pushNotifications,
          taskReminders: settings.taskReminders,
          weeklyDigest: settings.weeklyDigest,
          autoSave: settings.autoSave,
          showCompletedTasks: settings.showCompletedTasks,
          allowCookies: settings.allowCookies,
          allowCachedData: settings.allowCachedData,
          updatedAt: new Date(),
        },
        create: {
          userId: this.userId,
          theme: settings.theme,
          compactMode: settings.compactMode,
          showAnimations: settings.showAnimations,
          defaultView: settings.defaultView,
          showRecentTasks: settings.showRecentTasks,
          showTeamActivity: settings.showTeamActivity,
          showQuickActions: settings.showQuickActions,
          tasksPerPage: settings.tasksPerPage,
          emailNotifications: settings.emailNotifications,
          pushNotifications: settings.pushNotifications,
          taskReminders: settings.taskReminders,
          weeklyDigest: settings.weeklyDigest,
          autoSave: settings.autoSave,
          showCompletedTasks: settings.showCompletedTasks,
          allowCookies: settings.allowCookies,
          allowCachedData: settings.allowCachedData,
        },
      });
      console.log("SettingsManager - Database save result:", result);
    } catch (error) {
      console.error("Error saving settings to database:", error);
      throw error;
    }
  }

  /**
   * Get settings from encrypted cookies
   */
  private async getSettingsFromCookies(): Promise<UserSettingsData | null> {
    try {
      const cookieStore = cookies();
      const encryptedSettings = cookieStore.get(SETTINGS_COOKIE_NAME);

      if (!encryptedSettings?.value) return null;

      const decryptedData = await decrypt(encryptedSettings.value);
      const settings = JSON.parse(decryptedData);

      // Validate settings structure
      if (this.validateSettings(settings)) {
        return settings;
      }

      return null;
    } catch (error) {
      console.error("Error getting settings from cookies:", error);
      return null;
    }
  }

  /**
   * Save settings to encrypted cookies
   */
  private async saveSettingsToCookies(
    settings: UserSettingsData,
  ): Promise<void> {
    try {
      const cookieStore = cookies();
      const settingsJson = JSON.stringify(settings);
      const encryptedData = await encrypt(settingsJson);

      cookieStore.set(SETTINGS_COOKIE_NAME, encryptedData, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SETTINGS_COOKIE_MAX_AGE,
        path: "/",
      });
    } catch (error) {
      console.error("Error saving settings to cookies:", error);
      throw error;
    }
  }

  /**
   * Clear settings cookies (used on logout)
   */
  static async clearSettingsCookies(): Promise<void> {
    try {
      const cookieStore = cookies();
      cookieStore.delete(SETTINGS_COOKIE_NAME);
    } catch (error) {
      console.error("Error clearing settings cookies:", error);
    }
  }

  /**
   * Validate settings structure
   */
  private validateSettings(settings: any): settings is UserSettingsData {
    const requiredKeys = Object.keys(DEFAULT_SETTINGS);
    return requiredKeys.every((key) => key in settings);
  }
}

/**
 * Get user settings for server-side operations
 */
export async function getUserSettings(
  userId: string,
): Promise<UserSettingsData> {
  const settingsManager = new SettingsManager(userId);
  return await settingsManager.getUserSettings();
}

/**
 * Save user settings for server-side operations
 */
export async function saveUserSettings(
  userId: string,
  settings: Partial<UserSettingsData>,
): Promise<void> {
  const settingsManager = new SettingsManager(userId);
  await settingsManager.saveUserSettings(settings);
}

/**
 * Clear settings cookies on logout
 */
export async function clearSettingsCookies(): Promise<void> {
  await SettingsManager.clearSettingsCookies();
}
