import { create } from 'zustand';
import type { TimerState } from '../types';

interface TimerStore {
  state: TimerState;
  setState: (updater: TimerState | ((prev: TimerState) => TimerState)) => void;
  reset: () => void;
}

const initialState: TimerState = {
  status: 'idle',
  projectId: undefined,
  taskId: undefined,
  startedAt: undefined,
  pausedAt: undefined,
  accumulatedSeconds: 0,
};

export const useTimerStore = create<TimerStore>((set) => ({
  state: initialState,
  setState: (updater) =>
    set((store) => ({
      state:
        typeof updater === 'function' ? updater(store.state) : updater,
    })),
  reset: () => set({ state: initialState }),
}));
