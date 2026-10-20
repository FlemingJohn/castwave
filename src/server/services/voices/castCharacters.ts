import "server-only";
import type { Character } from "@/types/Character";
import type { CharacterProfile } from "@/types/CharacterProfile";
import type { VoiceName } from "@/types/VoiceName";

export function castCharacters(speakers: string[], profiles: CharacterProfile[]): Character[] {
  const usedVoices = new Set(speakers.flatMap((name) => VOICE_BY_SPEAKER[name] ?? []));
  return speakers.map((name, position) => {
    const fixedVoice = VOICE_BY_SPEAKER[name];
    const profile = profiles.find((candidate) => candidate.name === name);
    const voice = fixedVoice ?? pickVoice(profile, position, usedVoices);
    usedVoices.add(voice);
    return { name, voice, effect: "none", volume: 85 };
  });
}

function pickVoice(profile: CharacterProfile | undefined, position: number, usedVoices: Set<VoiceName>): VoiceName {
  const gender = profile && profile.gender !== "unknown" ? profile.gender : position % 2 === 0 ? "male" : "female";
  const preferred = VOICES_BY_AGE[gender][profile ? profile.age : "adult"];
  const sameGender = Object.values(VOICES_BY_AGE[gender]).flat();
  const choices = [...preferred, ...sameGender, ...UNCLEAR_VOICES];
  return choices.find((voice) => !usedVoices.has(voice)) ?? preferred[position % preferred.length] ?? "paul";
}

const VOICE_BY_SPEAKER: Record<string, VoiceName | undefined> = {
  Narrator: "george",
  Maya: "jane",
  Daniel: "paul",
};

const VOICES_BY_AGE: Record<"female" | "male", Record<CharacterProfile["age"], VoiceName[]>> = {
  female: {
    child: ["jane", "anna"],
    young: ["anna", "jane", "mary"],
    adult: ["eve", "mary", "iris"],
    old: ["vera", "iris"],
  },
  male: {
    child: ["paul", "reid"],
    young: ["reid", "paul"],
    adult: ["jean", "reid", "paul"],
    old: ["charles", "michael"],
  },
};

const UNCLEAR_VOICES: VoiceName[] = ["alba"];
