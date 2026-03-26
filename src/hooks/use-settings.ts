import { useCallback, useEffect } from 'react';
import { useSettingsStore } from '../store/settings';
import type { AppSettings } from '../types';

const STORAGE_KEY = 'stt:settings';

/**
 * Read/write app preferences with localStorage persistence.
 * In a full Tauri context this would delegate to tauri-plugin-store,
 * but localStorage keeps the logic testable outside the native shell.
 */
export function useSettings() {
  const { settings, updateSettings, resetSettings } = useSettingsStore();

  // Hydrate from storage once on mount
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Partial<AppSettings>;
      updateSettings(parsed);
    } catch {
      // Ignore corrupt data
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on every change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const setSetting = useCallback(
    <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      updateSettings({ [key]: value } as Partial<AppSettings>);
    },
    [updateSettings],
  );

  return { settings, setSetting, updateSettings, resetSettings };
}
