import { toDisplayName } from "@/services/text/toDisplayName";
import type { VoiceName } from "@/types/VoiceName";
import { LANGUAGE_BY_VOICE } from "./languageByVoice";

export function describeVoice(voice: VoiceName) {
  const name = toDisplayName(voice);
  const language = toDisplayName(LANGUAGE_BY_VOICE[voice]);
  return { name, language, label: `${name} · ${language}` };
}
