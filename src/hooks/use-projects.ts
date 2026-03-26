import { useCallback, useEffect } from "react";
import { useProjectsStore } from "../store/projects";
import type { Project, Task } from "../types";
import { useTimeLog } from "./use-time-log";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const PROJECT_COLORS = [
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#3b82f6", // blue
  "#ef4444", // red
  "#14b8a6", // teal
];

export function useProjects() {
  const store = useProjectsStore();
  const { entries } = useTimeLog();

  // Load persisted projects on mount
  useEffect(() => {
    const saved = localStorage.getItem("stt:projects");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Project[];
        store.setProjects(parsed);
      } catch {
        // Ignore parse errors
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist whenever projects change
  useEffect(() => {
    localStorage.setItem("stt:projects", JSON.stringify(store.projects));
  }, [store.projects]);

  const createProject = useCallback(
    (name: string, description?: string): Project => {
      const color =
        PROJECT_COLORS[store.projects.length % PROJECT_COLORS.length];
      const project: Project = {
        id: generateId(),
        name,
        color: color ?? "#6366f1",
        description,
        tasks: [],
        createdAt: new Date().toISOString(),
      };
      store.addProject(project);
      return project;
    },
    [store],
  );

  const createTask = useCallback(
    (projectId: string, name: string): Task => {
      const task: Task = {
        id: generateId(),
        projectId,
        name,
        createdAt: new Date().toISOString(),
      };
      store.addTask(projectId, task);
      return task;
    },
    [store],
  );

  const getTotalDuration = useCallback(
    (projectId: string): number => {
      return entries
        .filter((e) => e.projectId === projectId)
        .reduce((sum, e) => sum + e.duration, 0);
    },
    [entries],
  );

  return {
    projects: store.projects,
    selectedProjectId: store.selectedProjectId,
    selectedTaskId: store.selectedTaskId,
    selectProject: store.selectProject,
    selectTask: store.selectTask,
    createProject,
    updateProject: store.updateProject,
    deleteProject: store.deleteProject,
    createTask,
    updateTask: store.updateTask,
    deleteTask: store.deleteTask,
    getTotalDuration,
  };
}
