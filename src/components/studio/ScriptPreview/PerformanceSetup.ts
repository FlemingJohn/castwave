import type { VoicingJob } from "@/services/voicing/VoicingJob";
import type { AmbienceName } from "@/types/AmbienceName";
import type { PerformanceLine } from "./PerformanceLine";

export type PerformanceSetup = {
  audio: AudioContext;
  lines: PerformanceLine[];
  firstPosition: number;
  job: VoicingJob;
  ambience: AmbienceName | undefined;
};
