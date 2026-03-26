export interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
  tasks: Task[];
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  projectId: string;
  taskId?: string;
  startTime: string; // ISO 8601
  endTime?: string; // ISO 8601, undefined if running
  duration: number; // seconds
  notes?: string;
  tags: string[];
  autoLogged: boolean; // true if auto-stopped by idle detection
}

export interface TimerState {
  status: 'idle' | 'running' | 'paused';
  projectId?: string;
  taskId?: string;
  startedAt?: string;
  pausedAt?: string;
  accumulatedSeconds: number;
}

export interface ActivityState {
  isActive: boolean;
  lastActiveAt: string;
  idleSeconds: number;
  activeProcesses: string[]; // detected foreground app names
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  idleThresholdMinutes: number; // auto-pause after this many idle minutes
  globalShortcut: string; // e.g. "CmdOrCtrl+Shift+T"
  minimizeToTray: boolean;
  showCompactMode: boolean;
  autoStartOnLogin: boolean;
  notificationsEnabled: boolean;
}

export type ThemeMode = AppSettings['theme'];

export interface ExportOptions {
  format: 'csv' | 'json';
  dateFrom?: string;
  dateTo?: string;
  projectIds?: string[];
}
