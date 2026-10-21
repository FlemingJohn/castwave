import type { AmbienceName } from "@/types/AmbienceName";
import type { CueEffect } from "@/types/CueEffect";

export type SceneStageProps = {
  sceneId: string;
  picture: string | undefined;
  ambience: AmbienceName | undefined;
  speaker: string;
  text: string;
  previousText: string;
  colourNumber: number;
  isSound: boolean;
  isPlaying: boolean;
  spokenWordCount: number;
  effect: { kind: CueEffect; position: number } | null;
  readVoiceLevel: () => number;
};
