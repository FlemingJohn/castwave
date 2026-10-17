import "server-only";
import type { Character } from "@/types/Character";
import type { VoiceName } from "@/types/VoiceName";

export function castCharacters(speakers: string[]): Character[] {
  let nextVoice = 0;
  return speakers.map((name) => {
    const fixedVoice = VOICE_BY_SPEAKER[name];
    const voice = fixedVoice ?? VOICE_POOL[nextVoice % VOICE_POOL.length] ?? "charles";
    if (!fixedVoice) {
      nextVoice += 1;
    }
    return { name, voice, effect: "none", volume: 85 };
  });
}

const VOICE_BY_SPEAKER: Record<string, VoiceName | undefined> = {
  Narrator: "george",
  Maya: "jane",
  Daniel: "paul",
};

const VOICE_POOL: VoiceName[] = ["charles", "vera", "eve", "michael", "anna", "mary", "reid", "iris", "jean", "alba"];
