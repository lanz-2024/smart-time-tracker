import { useState } from "react";
import { useProjects } from "../hooks/use-projects";
import { useTimeLog } from "../hooks/use-time-log";
import { formatDuration } from "../utils/duration";

interface NewProjectFormProps {
  onSubmit: (name: string, description?: string) => void;
  onCancel: () => void;
}

function NewProjectForm({ onSubmit, onCancel }: NewProjectFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed, description.trim() || undefined);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 p-3 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 flex flex-col gap-2"
    >
      <input
        type="text"
        autoFocus
        placeholder="Project name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        maxLength={80}
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        maxLength={200}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!name.trim()}
          className="flex-1 py-1.5 text-xs font-medium rounded bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors"
        >
          Create
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-1.5 text-xs font-medium rounded border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function ProjectList() {
  const {
    projects,
    selectedProjectId,
    selectProject,
    createProject,
    deleteProject,
  } = useProjects();
  const { getEntriesForProject } = useTimeLog();
  const [showForm, setShowForm] = useState(false);

  const handleCreate = (name: string, description?: string) => {
    const project = createProject(name, description);
    selectProject(project.id);
    setShowForm(false);
  };

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col bg-gray-50 dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 h-full">
      <div className="px-4 pt-5 pb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Projects
        </h2>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          title="New project"
          aria-label="Create new project"
          className="w-6 h-6 flex items-center justify-center rounded text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors text-lg leading-none"
        >
          +
        </button>
      </div>

      {showForm && (
        <div className="px-3 pb-2">
          <NewProjectForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <nav
        className="flex-1 overflow-y-auto px-2 pb-4"
        aria-label="Project list"
      >
        {projects.length === 0 && !showForm && (
          <p className="px-2 py-4 text-xs text-gray-400 dark:text-gray-600 text-center">
            No projects yet.
            <br />
            Create one to start tracking.
          </p>
        )}

        {projects.map((project) => {
          const isActive = project.id === selectedProjectId;
          const projectEntries = getEntriesForProject(project.id);
          const totalDuration = projectEntries.reduce(
            (sum, e) => sum + e.duration,
            0,
          );

          return (
            <div key={project.id} className="group relative">
              <button
                type="button"
                onClick={() => selectProject(isActive ? null : project.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 flex items-start gap-2.5 transition-colors ${
                  isActive
                    ? "bg-indigo-100 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-100"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900"
                }`}
                aria-current={isActive ? "true" : undefined}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {project.name}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                    {project.tasks.length} task
                    {project.tasks.length !== 1 ? "s" : ""} &middot;{" "}
                    {totalDuration > 0 ? formatDuration(totalDuration) : "0s"}
                  </div>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                )}
              </button>

              {/* Delete button — only visible on hover */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Delete project "${project.name}"?`)) {
                    deleteProject(project.id);
                  }
                }}
                title={`Delete ${project.name}`}
                aria-label={`Delete project ${project.name}`}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition-all text-xs"
              >
                &times;
              </button>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
