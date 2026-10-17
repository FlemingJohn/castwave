import { useEffect, useState } from "react";
import { Script } from "@/types/Script";

const STORAGE_KEY = "castwave-script";

export function useStoredScript() {
  const [script, setScript] = useState<Script | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    const stored = Script.safeParse(saved ? JSON.parse(saved) : null);
    setScript(stored.success ? stored.data : null);
    setHasLoaded(true);
  }, []);

  function saveScript(newScript: Script) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(newScript));
    setScript(newScript);
  }

  return { script, hasLoaded, saveScript };
}
