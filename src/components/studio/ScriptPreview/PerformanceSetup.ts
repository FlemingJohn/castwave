import type { AmbienceName } from "@/types/AmbienceName";
import type { SoundName } from "@/types/SoundName";
import type { VoiceName } from "@/types/VoiceName";
import type { PerformanceLine } from "./PerformanceLine";

export type PerformanceSetup = {
  audio: AudioContext;
  lines: PerformanceLine[];
  firstPosition: number;
  tokenByVoice: Map<VoiceName, string>;
  sounds: Map<SoundName | AmbienceName, AudioBuffer>;
  ambience: AmbienceName | undefined;
  onFailure: (message: string) => void;
};
