import { useEffect, useRef, useState } from 'react';
import { useTimer } from '../hooks/use-timer';
import { useProjects } from '../hooks/use-projects';
import { formatTimerDisplay } from '../utils/duration';
import { TaskSelector } from './TaskSelector';

export function TrackerCard() {
  const { state, start, pause, resume, stop } = useTimer();
  const { projects, selectedProjectId, selectedTaskId } = useProjects();
  const [displaySeconds, setDisplaySeconds] = useState(state.accumulatedSeconds);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  // Real-time tick when running
  useEffect(() => {
    if (state.status === 'running' && state.startedAt) {
      const computeElapsed = () => {
        const base = state.accumulatedSeconds;
        const started = new Date(state.startedAt!).getTime();
        const delta = Math.floor((Date.now() - started) / 1000);
        setDisplaySeconds(base + delta);
      };
      computeElapsed();
      tickRef.current = setInterval(computeElapsed, 1000);
    } else {
      setDisplaySeconds(state.accumulatedSeconds);
    }

    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [state.status, state.startedAt, state.accumulatedSeconds]);

  const handleStart = async () => {
    if (!selectedProjectId) return;
    if (state.status === 'paused') {
      await resume();
    } else {
      await start(selectedProjectId, selectedTaskId ?? undefined);
    }
  };

  const handleStop = async () => {
    await stop();
  };

  const isRunning = state.status === 'running';
  const isPaused = state.status === 'paused';
  const isIdle = state.status === 'idle';
  const canStart = selectedProjectId !== null;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 p-8 flex flex-col items-center gap-6">
      {/* Timer display */}
      <div className="text-center">
        <div
          className="text-6xl font-mono font-semibold tabular-nums tracking-tight text-gray-900 dark:text-gray-50 transition-colors"
          aria-live="polite"
          aria-label={`Elapsed time: ${formatTimerDisplay(displaySeconds)}`}
        >
          {formatTimerDisplay(displaySeconds)}
        </div>
        {selectedProject && (
          <div className="mt-3 flex items-center justify-center gap-2">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: selectedProject.color }}
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
              {selectedProject.name}
            </span>
          </div>
        )}
        {!selectedProject && (
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            Select a project to start tracking
          </p>
        )}
      </div>

      {/* Task selector */}
      {selectedProject && (
        <div className="w-full max-w-xs">
          <TaskSelector />
        </div>
      )}

      {/* Status indicator */}
      {(isRunning || isPaused) && (
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isRunning ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
            }`}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
            {isRunning ? 'Recording' : 'Paused'}
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-3">
        {/* Start / Pause / Resume */}
        {isIdle && (
          <button
            type="button"
            onClick={() => void handleStart()}
            disabled={!canStart}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Start
          </button>
        )}
        {isRunning && (
          <button
            type="button"
            onClick={() => void pause()}
            className="px-6 py-2.5 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
          >
            Pause
          </button>
        )}
        {isPaused && (
          <button
            type="button"
            onClick={() => void handleStart()}
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Resume
          </button>
        )}

        {/* Stop — only when active */}
        {!isIdle && (
          <button
            type="button"
            onClick={() => void handleStop()}
            className="px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
