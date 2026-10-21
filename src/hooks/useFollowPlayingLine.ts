import { type RefObject, useEffect } from "react";

export function useFollowPlayingLine(panelRef: RefObject<HTMLElement | null>, playingPosition: number) {
  useEffect(() => {
    const panel = panelRef.current;
    const line = panel?.querySelectorAll("li[data-status]")[playingPosition];
    if (!panel || !(line instanceof HTMLElement)) {
      return;
    }
    const top = line.offsetTop - panel.clientHeight / 3;
    panel.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }, [panelRef, playingPosition]);
}
