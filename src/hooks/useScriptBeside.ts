import { useEffect, useState } from "react";

const STORAGE_KEY = "castwave-script-beside";

export function useScriptBeside() {
  const [isBeside, setIsBeside] = useState(false);

  useEffect(() => {
    try {
      setIsBeside(sessionStorage.getItem(STORAGE_KEY) === "true");
    } catch {
      return;
    }
  }, []);

  function toggle() {
    const next = !isBeside;
    setIsBeside(next);
    try {
      sessionStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      return;
    }
  }

  return { isBeside, toggle };
}
