import { SPEECH_SAMPLE_RATE } from "@/services/speech/speechSampleRate";
import type { VoicedLine } from "@/types/VoicedLine";
import { loadShowcaseStory } from "./loadShowcaseStory";

export async function loadShowcaseLines(slug: string, onLine: (key: string, line: VoicedLine) => void) {
  const story = await loadShowcaseStory(slug);
  const decoder = new OfflineAudioContext(1, 1, SPEECH_SAMPLE_RATE);
  await Promise.all(
    Object.entries(story.lines).map(async ([key, saved]) => {
      const response = await fetch(`/showcase/${slug}/${saved.audio}`);
      if (!response.ok) {
        throw new Error(`A saved line of "${slug}" could not be loaded (HTTP ${response.status}).`);
      }
      const buffer = await decoder.decodeAudioData(await response.arrayBuffer());
      onLine(key, { buffer, wordStarts: saved.wordStarts });
    }),
  );
}
