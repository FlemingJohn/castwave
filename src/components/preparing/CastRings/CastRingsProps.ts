import type { Character } from "@/types/Character";
import type { VoicingProgress } from "@/types/VoicingProgress";

export type CastRingsProps = {
  cast: Character[];
  progress: VoicingProgress | null;
};
