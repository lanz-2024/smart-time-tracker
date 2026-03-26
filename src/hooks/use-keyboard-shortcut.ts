import { useEffect, useRef } from "react";

interface UseKeyboardShortcutOptions {
  /** e.g. "CmdOrCtrl+Shift+T" — the display format from AppSettings */
  shortcut: string;
  onActivate: () => void;
  enabled?: boolean;
}

/**
 * Registers a keyboard shortcut using the browser KeyboardEvent API.
 * In the full Tauri build, global shortcuts (system-wide) are registered via
 * the tauri-plugin-global-shortcut. This hook handles in-app shortcut capture
 * so the UI works identically in both Tauri and browser/test environments.
 *
 * Shortcut format: "CmdOrCtrl+Shift+T" → parsed into modifier + key combos.
 */
export function useKeyboardShortcut({
  shortcut,
  onActivate,
  enabled = true,
}: UseKeyboardShortcutOptions) {
  const callbackRef = useRef(onActivate);
  callbackRef.current = onActivate;

  useEffect(() => {
    if (!enabled) return;

    const parts = shortcut.split("+").map((p) => p.trim().toLowerCase());
    const key = parts[parts.length - 1] ?? "";
    const needsCtrl = parts.includes("ctrl") || parts.includes("cmdorctrl");
    const needsMeta = parts.includes("cmd") || parts.includes("cmdorctrl");
    const needsShift = parts.includes("shift");
    const needsAlt = parts.includes("alt");

    const handler = (e: KeyboardEvent) => {
      const metaOrCtrl = needsCtrl ? e.ctrlKey : needsMeta ? e.metaKey : false;
      const modifierMatch =
        (needsCtrl || needsMeta
          ? metaOrCtrl || e.ctrlKey || e.metaKey
          : true) &&
        (needsShift ? e.shiftKey : !e.shiftKey || needsShift) &&
        (needsAlt ? e.altKey : !e.altKey);

      if (modifierMatch && e.key.toLowerCase() === key) {
        e.preventDefault();
        callbackRef.current();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcut, enabled]);
}
