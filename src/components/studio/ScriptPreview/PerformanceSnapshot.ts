import type { CueStatus } from "@/types/CueStatus";

export type PerformanceSnapshot = {
  statuses: CueStatus[];
  playingPosition: number;
  spokenWordCount: number;
  hasFinished: boolean;
};
