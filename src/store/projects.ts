import { create } from 'zustand';
import type { Project, Task } from '../types';

interface ProjectsStore {
  projects: Project[];
  selectedProjectId: string | null;
  selectedTaskId: string | null;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Omit<Project, 'id'>>) => void;
  deleteProject: (id: string) => void;
  addTask: (projectId: string, task: Task) => void;
  updateTask: (projectId: string, taskId: string, updates: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (projectId: string, taskId: string) => void;
  selectProject: (id: string | null) => void;
  selectTask: (id: string | null) => void;
}

export const useProjectsStore = create<ProjectsStore>((set) => ({
  projects: [],
  selectedProjectId: null,
  selectedTaskId: null,

  setProjects: (projects) => set({ projects }),

  addProject: (project) =>
    set((state) => ({ projects: [...state.projects, project] })),

  updateProject: (id, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      ),
    })),

  deleteProject: (id) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      selectedProjectId: state.selectedProjectId === id ? null : state.selectedProjectId,
    })),

  addTask: (projectId, task) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, tasks: [...p.tasks, task] } : p,
      ),
    })),

  updateTask: (projectId, taskId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              tasks: p.tasks.map((t) =>
                t.id === taskId ? { ...t, ...updates } : t,
              ),
            }
          : p,
      ),
    })),

  deleteTask: (projectId, taskId) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId
          ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
          : p,
      ),
      selectedTaskId: state.selectedTaskId === taskId ? null : state.selectedTaskId,
    })),

  selectProject: (id) => set({ selectedProjectId: id, selectedTaskId: null }),
  selectTask: (id) => set({ selectedTaskId: id }),
}));
