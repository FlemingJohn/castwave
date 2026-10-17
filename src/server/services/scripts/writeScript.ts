import "server-only";
import { LlmGatewayError } from "@/server/errors/LlmGatewayError";
import { askLlmGateway } from "@/server/services/llm/askLlmGateway";
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

export async function writeScript(source: WritableSource, format: SpokenFormat) {
  if (source.kind === "idea") {
    const instructions = format === "podcast" ? PODCAST_INSTRUCTIONS : STORY_INSTRUCTIONS;
    const length = `Length: about ${source.minutes * WORDS_PER_MINUTE} words.`;
    return askForDraft(instructions, `Idea: ${source.idea}\n${length}`);
  }
  if (format === "podcast") {
    const material = source.text.slice(0, PODCAST_MATERIAL_LIMIT);
    return askForDraft(PODCAST_INSTRUCTIONS, `Material:\n${material}\n\nLength: about 3 minutes.`);
  }
  const chunks = splitIntoChunks(source.text);
  const drafts = await Promise.all(chunks.map((chunk) => askForDraft(AUDIOBOOK_INSTRUCTIONS, `Story:\n${chunk}`)));
  const lines = drafts.flatMap((draft) => draft.lines);
  const title = drafts[0] ? drafts[0].title : "Untitled";
  return { title, lines: restoreMissingText(source.text, lines) };
}

async function askForDraft(instructions: string, request: string) {
  for (const attempt of [1, 2]) {
    const reply = await askLlmGateway(instructions, request);
    const draft = readDraftScript(reply);
    if (draft) {
      return draft;
    }
    console.warn(`LLM Gateway reply ${attempt} was not a valid script`);
  }
  throw new LlmGatewayError("the reply was not a valid script twice in a row");
}

function readDraftScript(reply: string) {
  const start = reply.indexOf("{");
  const end = reply.lastIndexOf("}");
  if (start === -1 || end <= start) {
    return undefined;
  }
  const candidate = readJson(reply.slice(start, end + 1));
  const draft = DraftScript.safeParse(candidate);
  return draft.success ? draft.data : undefined;
}

function readJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
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
