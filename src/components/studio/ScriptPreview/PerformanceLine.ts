import type { SoundName } from "@/types/SoundName";

export type PerformanceLine =
  | { kind: "speech"; key: string; startsParagraph: boolean }
  | { kind: "sound"; sound: SoundName; startsParagraph: boolean };
