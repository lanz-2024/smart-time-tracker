import { ProjectList } from './components/ProjectList';
import { TrackerCard } from './components/TrackerCard';
import { useKeyboardShortcut } from './hooks/use-keyboard-shortcut';
import { useProjects } from './hooks/use-projects';
import { useSettings } from './hooks/use-settings';
import { useTheme } from './hooks/use-theme';
import { useTimer } from './hooks/use-timer';
import { useUpdateChecker } from './hooks/use-update-checker';

function AppShortcutHandler() {
  const { settings } = useSettings();
  const { state, start, pause, resume } = useTimer();
  const { selectedProjectId } = useProjects();

  useKeyboardShortcut({
    shortcut: settings.globalShortcut,
    onActivate: () => {
      if (state.status === 'running') {
        void pause();
      } else if (state.status === 'paused') {
        void resume();
      } else if (selectedProjectId) {
        void start(selectedProjectId);
      }
    },
  });

  return null;
}

export default function App() {
  useTheme();
  useUpdateChecker();

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}
    >
      <AppShortcutHandler />
      <ProjectList />
      <main className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-sm">
          <TrackerCard />
        </div>
      </main>
    </div>
  );
}
