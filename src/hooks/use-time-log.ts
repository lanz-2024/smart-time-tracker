import { useCallback, useEffect, useState } from "react";
import type { TimeEntry } from "../types";

const STORAGE_KEY = "stt:time-entries";

export function useTimeLog() {
  const [entries, setEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as TimeEntry[];
        setEntries(parsed);
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const persist = useCallback((updated: TimeEntry[]) => {
    setEntries(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addEntry = useCallback(
    (entry: TimeEntry) => {
      persist([...entries, entry]);
    },
    [entries, persist],
  );

  const updateEntry = useCallback(
    (id: string, updates: Partial<TimeEntry>) => {
      persist(entries.map((e) => (e.id === id ? { ...e, ...updates } : e)));
    },
    [entries, persist],
  );

  const deleteEntry = useCallback(
    (id: string) => {
      persist(entries.filter((e) => e.id !== id));
    },
    [entries, persist],
  );

  const getEntriesForDate = useCallback(
    (date: string): TimeEntry[] => {
      return entries.filter((e) => e.startTime.startsWith(date));
    },
    [entries],
  );

  const getEntriesForProject = useCallback(
    (projectId: string): TimeEntry[] => {
      return entries.filter((e) => e.projectId === projectId);
    },
    [entries],
  );

  const getTodayTotal = useCallback((): number => {
    const today = new Date().toISOString().slice(0, 10);
    return getEntriesForDate(today).reduce((sum, e) => sum + e.duration, 0);
  }, [getEntriesForDate]);

  const getWeekTotal = useCallback((): number => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    weekStart.setHours(0, 0, 0, 0);
    return entries
      .filter((e) => new Date(e.startTime) >= weekStart)
      .reduce((sum, e) => sum + e.duration, 0);
  }, [entries]);

  return {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesForDate,
    getEntriesForProject,
    getTodayTotal,
    getWeekTotal,
  };
}
