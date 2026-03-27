import { invoke } from '@tauri-apps/api/core';
import { useCallback } from 'react';
import { useTimerStore } from '../store/timer';
import type { TimeEntry, TimerState } from '../types';
import { useTimeLog } from './use-time-log';

export function useTimer() {
  const { state, setState } = useTimerStore();
  const { addEntry } = useTimeLog();

  const start = useCallback(
    async (projectId: string, taskId?: string) => {
      const startedAt = new Date().toISOString();
      await invoke('start_timer', { projectId, taskId, startedAt });
      setState({
        status: 'running',
        projectId,
        taskId,
        startedAt,
        pausedAt: undefined,
        accumulatedSeconds: 0,
      });
    },
    [setState],
  );

  const pause = useCallback(async () => {
    const elapsed = await invoke<number>('get_elapsed_seconds');
    await invoke('pause_timer');
    setState((prev: TimerState) => ({
      ...prev,
      status: 'paused',
      pausedAt: new Date().toISOString(),
      accumulatedSeconds: prev.accumulatedSeconds + elapsed,
    }));
  }, [setState]);

  const resume = useCallback(async () => {
    const resumedAt = new Date().toISOString();
    await invoke('resume_timer', { resumedAt });
    setState((prev: TimerState) => ({
      ...prev,
      status: 'running',
      startedAt: resumedAt,
      pausedAt: undefined,
    }));
  }, [setState]);

  const stop = useCallback(async () => {
    const entry = await invoke<TimeEntry>('stop_timer');
    await addEntry(entry);
    setState({ status: 'idle', accumulatedSeconds: 0 });
  }, [setState, addEntry]);

  return { state, start, pause, resume, stop };
}
