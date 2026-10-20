import "server-only";
import { askForJson } from "@/server/services/llm/askForJson";
import { AUDIOBOOK_INSTRUCTIONS } from "@/server/services/scripts/prompts/audiobookInstructions";
import { PODCAST_INSTRUCTIONS } from "@/server/services/scripts/prompts/podcastInstructions";
import { STORY_INSTRUCTIONS } from "@/server/services/scripts/prompts/storyInstructions";
import { restoreMissingText } from "@/server/services/scripts/restoreMissingText";
import { DraftScript } from "@/types/DraftScript";
import type { ScriptSource } from "@/types/ScriptSource";

type WritableSource = Extract<ScriptSource, { kind: "text" | "idea" }>;
type SpokenFormat = "audiobook" | "podcast";

const CHUNK_SIZE_IN_CHARACTERS = 3000;
const PODCAST_MATERIAL_LIMIT = 12000;
const WORDS_PER_MINUTE = 150;
const QUOTE_MARKS = /["“”]/;
const CHUNK_TOKENS = 3000;
const PODCAST_TOKENS = 2000;
const TOKENS_PER_MINUTE_OF_STORY = 340;

export async function writeScript(source: WritableSource, format: SpokenFormat) {
  if (source.kind === "idea") {
    const instructions = format === "podcast" ? PODCAST_INSTRUCTIONS : STORY_INSTRUCTIONS;
    const request = `Idea: ${source.idea}\nLength: about ${source.minutes * WORDS_PER_MINUTE} words.`;
    return askForJson({ instructions, request, maxTokens: TOKENS_PER_MINUTE_OF_STORY * source.minutes + 600 }, DraftScript);
  }
  if (format === "podcast") {
    const request = `Material:\n${source.text.slice(0, PODCAST_MATERIAL_LIMIT)}\n\nLength: about 3 minutes.`;
    return askForJson({ instructions: PODCAST_INSTRUCTIONS, request, maxTokens: PODCAST_TOKENS }, DraftScript);
  }
  const chunks = splitIntoChunks(source.text);
  const drafts = await Promise.all(
    chunks.map((chunk) =>
      askForJson({ instructions: AUDIOBOOK_INSTRUCTIONS, request: `Story:\n${chunk}`, maxTokens: CHUNK_TOKENS }, DraftScript, (draft) =>
        isSplitWell(draft, chunk),
      ),
    ),
  );
  const lines = drafts.flatMap((draft) => draft.lines);
  const title = drafts[0] ? drafts[0].title : "Untitled";
  return { title, lines: restoreMissingText(source.text, lines) };
}

function isSplitWell(draft: DraftScript, storyText: string) {
  const hasQuotesLeft = draft.lines.some((line) => QUOTE_MARKS.test(line.text));
  const speakerCount = new Set(draft.lines.map((line) => line.speaker)).size;
  const storyHasDialogue = QUOTE_MARKS.test(storyText);
  return !hasQuotesLeft && (!storyHasDialogue || speakerCount > 1);
}

function splitIntoChunks(text: string) {
  const paragraphs = text.split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const paragraph of paragraphs) {
    if (current && current.length + paragraph.length > CHUNK_SIZE_IN_CHARACTERS) {
      chunks.push(current);
      current = "";
    }
    current = current ? `${current}\n\n${paragraph}` : paragraph;
  }
  if (current) {
    chunks.push(current);
  }
  return chunks;
}
