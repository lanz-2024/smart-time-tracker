import type { TimeEntry, Project, ExportOptions } from "../types";

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function exportToCsv(entries: TimeEntry[], projects: Project[]): string {
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const taskMap = new Map(
    projects.flatMap((p) => p.tasks.map((t) => [t.id, t])),
  );

  const headers = [
    "ID",
    "Project",
    "Task",
    "Start Time",
    "End Time",
    "Duration (seconds)",
    "Notes",
    "Tags",
    "Auto Logged",
  ];

  const rows = entries.map((entry) => {
    const project = projectMap.get(entry.projectId);
    const task = entry.taskId ? taskMap.get(entry.taskId) : undefined;
    return [
      entry.id,
      project?.name ?? entry.projectId,
      task?.name ?? "",
      entry.startTime,
      entry.endTime ?? "",
      entry.duration.toString(),
      entry.notes ?? "",
      entry.tags.join(";"),
      entry.autoLogged ? "yes" : "no",
    ]
      .map(escapeCsvField)
      .join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

export function exportToJson(
  entries: TimeEntry[],
  projects: Project[],
): string {
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const taskMap = new Map(
    projects.flatMap((p) => p.tasks.map((t) => [t.id, t])),
  );

  const enriched = entries.map((entry) => ({
    ...entry,
    projectName: projectMap.get(entry.projectId)?.name,
    taskName: entry.taskId ? taskMap.get(entry.taskId)?.name : undefined,
  }));

  return JSON.stringify(enriched, null, 2);
}

export function filterEntries(
  entries: TimeEntry[],
  options: ExportOptions,
): TimeEntry[] {
  return entries.filter((entry) => {
    if (options.dateFrom && entry.startTime < options.dateFrom) return false;
    if (options.dateTo && entry.startTime > options.dateTo) return false;
    if (options.projectIds && !options.projectIds.includes(entry.projectId))
      return false;
    return true;
  });
}

export function downloadFile(
  content: string,
  filename: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
