import { useEffect } from "react";
import { useSettings } from "./use-settings";
import type { ThemeMode } from "../types";

function resolveTheme(mode: ThemeMode): "light" | "dark" {
  if (mode !== "system") return mode;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

/**
 * Applies the theme class to <body> and listens for OS-level changes when
 * theme is set to "system".
 */
export function useTheme() {
  const { settings, setSetting } = useSettings();
  const { theme } = settings;

  useEffect(() => {
    const apply = () => {
      const resolved = resolveTheme(theme);
      document.body.classList.toggle("dark", resolved === "dark");
    };

    apply();

    if (theme !== "system") return;

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const setTheme = (mode: ThemeMode) => setSetting("theme", mode);

  return { theme, setTheme, resolvedTheme: resolveTheme(theme) };
}
