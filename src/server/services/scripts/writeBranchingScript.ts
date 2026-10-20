import "server-only";
import { askForJson } from "@/server/services/llm/askForJson";
import { planScenes } from "@/server/services/scripts/planScenes";
import { OUTLINE_INSTRUCTIONS } from "@/server/services/scripts/prompts/outlineInstructions";
import { SCENE_INSTRUCTIONS } from "@/server/services/scripts/prompts/sceneInstructions";
import type { DraftLine } from "@/types/DraftLine";
import { DraftScript } from "@/types/DraftScript";
import type { ScenePlan } from "@/types/ScenePlan";
import { StoryOutline } from "@/types/StoryOutline";

const MATERIAL_LIMIT = 4000;
const WORDS_PER_SCENE = 100;
const SCENES_AT_ONCE = 4;
const LISTENER_NAMES = new Set(["you", "listener", "player", "reader"]);
const OUTLINE_TOKENS = 1500;
const SCENE_TOKENS = 1200;
const QUOTE_MARKS = /["“”]/;

export async function writeBranchingScript(material: string) {
  const outlineRequest = `Material:\n${material.slice(0, MATERIAL_LIMIT)}`;
  const outline = await askForJson({ instructions: OUTLINE_INSTRUCTIONS, request: outlineRequest, maxTokens: OUTLINE_TOKENS }, StoryOutline);
  const plans = planScenes(outline);
  const drafts: DraftScript[] = [];
  for (let start = 0; start < plans.length; start += SCENES_AT_ONCE) {
    const wave = plans.slice(start, start + SCENES_AT_ONCE);
    const written = await Promise.all(
      wave.map((plan) =>
        askForJson({ instructions: SCENE_INSTRUCTIONS, request: describeScene(outline, plan), maxTokens: SCENE_TOKENS }, DraftScript, isWrittenWell),
      ),
    );
    drafts.push(...written);
  }
  const scenes = plans.map((plan, position) => ({ plan, lines: (drafts[position]?.lines ?? []).map(giveListenerLinesToNarrator) }));
  return { title: outline.title, scenes };
}

function giveListenerLinesToNarrator(line: DraftLine): DraftLine {
  return LISTENER_NAMES.has(line.speaker.toLowerCase()) ? { ...line, speaker: "Narrator" } : line;
}

function describeScene(outline: StoryOutline, plan: ScenePlan) {
  const storySoFar = plan.storySoFar.length > 0 ? plan.storySoFar.map((step) => `- ${step}`).join("\n") : "- This is the start.";
  const ending = plan.question
    ? `Ends on the question: ${plan.question}`
    : `This scene is the ending called "${plan.ending ?? plan.title}". Close the story.`;
  return [
    `Story title: ${outline.title}`,
    `Premise: ${outline.premise}`,
    `Characters: ${outline.characters.join(", ")}`,
    `Story so far:\n${storySoFar}`,
    `Scene: ${plan.summary}`,
    ending,
    `Length: about ${WORDS_PER_SCENE} words.`,
  ].join("\n");
}

function isWrittenWell(draft: DraftScript) {
  const hasQuotesLeft = draft.lines.some((line) => QUOTE_MARKS.test(line.text));
  return !hasQuotesLeft && draft.lines.length >= 3;
}
