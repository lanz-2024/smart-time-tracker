export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

export function formatDurationVerbose(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (h > 0) parts.push(`${h} hour${h !== 1 ? "s" : ""}`);
  if (m > 0) parts.push(`${m} minute${m !== 1 ? "s" : ""}`);
  if (s > 0 || parts.length === 0)
    parts.push(`${s} second${s !== 1 ? "s" : ""}`);
  return parts.join(", ");
}

export function parseDuration(str: string): number {
  const match = str.match(/^(\d+h)?\s*(\d+m)?\s*(\d+s)?$/);
  if (!match) return 0;
  const h = parseInt(match[1] ?? "0") || 0;
  const m = parseInt(match[2] ?? "0") || 0;
  const s = parseInt(match[3] ?? "0") || 0;
  return h * 3600 + m * 60 + s;
}

/**
 * Format a duration as HH:MM:SS for the timer display.
 */
export function formatTimerDisplay(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = m.toString().padStart(2, "0");
  const ss = s.toString().padStart(2, "0");
  if (h > 0) return `${h}:${mm}:${ss}`;
  return `${mm}:${ss}`;
}

/**
 * Sum durations of all time entries within a date range.
 */
export function sumDurations(durations: number[]): number {
  return durations.reduce((acc, d) => acc + d, 0);
}
