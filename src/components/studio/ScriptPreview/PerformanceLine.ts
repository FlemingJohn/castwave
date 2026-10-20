import type { SoundName } from "@/types/SoundName";
import type { VoiceName } from "@/types/VoiceName";

export type PerformanceLine =
  | { kind: "speech"; text: string; voice: VoiceName; startsParagraph: boolean }
  | { kind: "sound"; sound: SoundName; startsParagraph: boolean };
