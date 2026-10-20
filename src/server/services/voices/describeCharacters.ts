import "server-only";
import { LlmGatewayError } from "@/server/errors/LlmGatewayError";
import { askForJson } from "@/server/services/llm/askForJson";
import { CASTING_INSTRUCTIONS } from "@/server/services/voices/prompts/castingInstructions";
import { CharacterProfiles } from "@/types/CharacterProfiles";
import type { DraftLine } from "@/types/DraftLine";

const LINES_PER_CHARACTER = 3;
const MENTIONS_PER_CHARACTER = 3;
const CASTING_TOKENS = 400;

export async function describeCharacters(lines: DraftLine[]) {
  const speakers = [...new Set(lines.map((line) => line.speaker))].filter((speaker) => speaker !== "Narrator");
  if (speakers.length === 0) {
    return [];
  }
  const request = `Characters:\n${speakers.map((speaker) => describeSpeaker(speaker, lines)).join("\n")}`;
  try {
    const answer = await askForJson(
      { instructions: CASTING_INSTRUCTIONS, request, maxTokens: CASTING_TOKENS },
      CharacterProfiles,
    );
    return answer.characters;
  } catch (error) {
    if (error instanceof LlmGatewayError) {
      return [];
    }
    throw error;
  }
}

function describeSpeaker(speaker: string, lines: DraftLine[]) {
  const samples = lines.flatMap((line, position) => {
    if (line.speaker !== speaker) {
      return [];
    }
    const next = lines[position + 1];
    const narration = next && next.speaker === "Narrator" ? ` (narration: ${next.text.slice(0, 120)})` : "";
    return [`"${line.text.slice(0, 120)}"${narration}`];
  });
  const mentions = findMentions(speaker, lines);
  const context = mentions.length > 0 ? ` (story says: ${mentions.join(" ")})` : "";
  return `- ${speaker}: ${samples.slice(0, LINES_PER_CHARACTER).join(" ")}${context}`;
}

function findMentions(speaker: string, lines: DraftLine[]) {
  const name = speaker.replace(/^the\s+/i, "").toLowerCase();
  const sentences = lines
    .filter((line) => line.speaker === "Narrator")
    .flatMap((line) => line.text.split(/(?<=[.!?])\s+/));
  return sentences.filter((sentence) => sentence.toLowerCase().includes(name)).slice(0, MENTIONS_PER_CHARACTER);
}
