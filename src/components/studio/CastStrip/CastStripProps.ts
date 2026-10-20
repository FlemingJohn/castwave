import type { Character } from "@/types/Character";
import type { VoiceName } from "@/types/VoiceName";

export type CastStripProps = {
  cast: Character[];
  onVoiceChange: (characterName: string, voice: VoiceName) => void;
};
