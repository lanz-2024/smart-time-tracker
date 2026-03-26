import { useCallback, useEffect, useState } from "react";

const CURRENT_VERSION = "0.1.0";
const CHECK_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const RELEASES_API =
  "https://api.github.com/repos/lanz-2024/smart-time-tracker/releases/latest";

interface UpdateInfo {
  version: string;
  releaseUrl: string;
  publishedAt: string;
}

interface UseUpdateCheckerResult {
  latestVersion: UpdateInfo | null;
  hasUpdate: boolean;
  isChecking: boolean;
  error: string | null;
  checkNow: () => Promise<void>;
  dismiss: () => void;
}

function semverGt(a: string, b: string): boolean {
  const parse = (v: string) => v.replace(/^v/, "").split(".").map(Number);
  const [aMaj = 0, aMin = 0, aPatch = 0] = parse(a);
  const [bMaj = 0, bMin = 0, bPatch = 0] = parse(b);
  if (aMaj !== bMaj) return aMaj > bMaj;
  if (aMin !== bMin) return aMin > bMin;
  return aPatch > bPatch;
}

export function useUpdateChecker(): UseUpdateCheckerResult {
  const [latestVersion, setLatestVersion] = useState<UpdateInfo | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkNow = useCallback(async () => {
    setIsChecking(true);
    setError(null);
    try {
      const res = await fetch(RELEASES_API, {
        headers: { Accept: "application/vnd.github+json" },
      });
      if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
      const data = (await res.json()) as {
        tag_name: string;
        html_url: string;
        published_at: string;
      };
      setLatestVersion({
        version: data.tag_name.replace(/^v/, ""),
        releaseUrl: data.html_url,
        publishedAt: data.published_at,
      });
      setDismissed(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update check failed");
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    void checkNow();
    const interval = setInterval(() => void checkNow(), CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkNow]);

  const hasUpdate =
    !dismissed &&
    latestVersion !== null &&
    semverGt(latestVersion.version, CURRENT_VERSION);

  return {
    latestVersion,
    hasUpdate,
    isChecking,
    error,
    checkNow,
    dismiss: () => setDismissed(true),
  };
}
