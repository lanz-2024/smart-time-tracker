import { useState } from 'react';
import { useProjects } from '../hooks/use-projects';

export function TaskSelector() {
  const { projects, selectedProjectId, selectedTaskId, selectTask, createTask } = useProjects();
  const [newTaskName, setNewTaskName] = useState('');
  const [showInput, setShowInput] = useState(false);

  const project = projects.find((p) => p.id === selectedProjectId);
  if (!project) return null;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__new__') {
      setShowInput(true);
    } else {
      selectTask(val === '' ? null : val);
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newTaskName.trim();
    if (!trimmed || !selectedProjectId) return;
    const task = createTask(selectedProjectId, trimmed);
    selectTask(task.id);
    setNewTaskName('');
    setShowInput(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="task-select"
        className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide"
      >
        Task
      </label>

      {!showInput ? (
        <select
          id="task-select"
          value={selectedTaskId ?? ''}
          onChange={handleSelectChange}
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        >
          <option value="">No specific task</option>
          {project.tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.name}
            </option>
          ))}
          <option value="__new__">+ New task&hellip;</option>
        </select>
      ) : (
        <form onSubmit={handleCreateTask} className="flex gap-2">
          <input
            type="text"
            placeholder="Task name"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            className="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            maxLength={100}
          />
          <button
            type="submit"
            disabled={!newTaskName.trim()}
            className="px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white transition-colors"
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => {
              setShowInput(false);
              setNewTaskName('');
            }}
            className="px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        </form>
      )}
    </div>
  );
}
