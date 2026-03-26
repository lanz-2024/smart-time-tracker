import { invoke } from '@tauri-apps/api/core';
import { useEffect, useRef, useState } from 'react';
import type { ActivityState } from '../types';

const POLL_INTERVAL_MS = 5000;

const defaultActivityState: ActivityState = {
  isActive: true,
  lastActiveAt: new Date().toISOString(),
  idleSeconds: 0,
  activeProcesses: [],
};

interface UseActivityMonitorOptions {
  onIdle?: (idleSeconds: number) => void;
  onResume?: () => void;
  idleThresholdSeconds?: number;
}

export function useActivityMonitor({
  onIdle,
  onResume,
  idleThresholdSeconds = 300,
}: UseActivityMonitorOptions = {}) {
  const [activityState, setActivityState] = useState<ActivityState>(defaultActivityState);
  const wasIdleRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const state = await invoke<ActivityState>('get_activity_state');
        setActivityState(state);

        const isNowIdle = state.idleSeconds >= idleThresholdSeconds;

        if (isNowIdle && !wasIdleRef.current) {
          wasIdleRef.current = true;
          onIdle?.(state.idleSeconds);
        } else if (!isNowIdle && wasIdleRef.current) {
          wasIdleRef.current = false;
          onResume?.();
        }
      } catch {
        // Silently handle errors during dev (outside Tauri context)
      }
    };

    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS);
    void poll(); // immediate first poll

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [onIdle, onResume, idleThresholdSeconds]);

  return activityState;
}
