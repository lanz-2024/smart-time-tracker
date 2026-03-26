import { create } from "zustand";
import type { AppSettings } from "../types";

interface SettingsStore {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

export const defaultSettings: AppSettings = {
  theme: "system",
  idleThresholdMinutes: 5,
  globalShortcut: "CmdOrCtrl+Shift+T",
  minimizeToTray: true,
  showCompactMode: false,
  autoStartOnLogin: false,
  notificationsEnabled: true,
};

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaultSettings,

  updateSettings: (updates) =>
    set((state) => ({
      settings: { ...state.settings, ...updates },
    })),

  resetSettings: () => set({ settings: defaultSettings }),
}));
