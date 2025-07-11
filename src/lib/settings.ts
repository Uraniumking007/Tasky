import { cookies } from "next/headers";
import { encrypt, decrypt } from "./crypto";

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
   * Get user settings from cookies
   */
  async getUserSettings(): Promise<UserSettingsData> {
    try {
      // Try to get from cookies if allowed
      if (this.allowCookies) {
        const cookieSettings = await this.getSettingsFromCookies();
        if (cookieSettings) {
          return cookieSettings;
        }
      }

      // Return default settings
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error("Error getting user settings:", error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save settings to cookies
   */
  async saveUserSettings(settings: Partial<UserSettingsData>): Promise<void> {
    try {
      // Get current settings
      const currentSettings = await this.getUserSettings();
      const updatedSettings = { ...currentSettings, ...settings };

      // Save to cookies if allowed
      if (this.allowCookies) {
        await this.saveSettingsToCookies(updatedSettings);
      }
    } catch (error) {
      console.error("Error saving user settings:", error);
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
