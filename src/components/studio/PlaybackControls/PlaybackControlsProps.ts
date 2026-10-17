import type { PerformanceStatus } from "@/types/PerformanceStatus";

export type PlaybackControlsProps = {
  status: PerformanceStatus;
  playingPosition: number;
  lineCount: number;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
};
