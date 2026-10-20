import "server-only";
import { readPage } from "@/server/services/pages/readPage";
import { writeBranchingScript } from "@/server/services/scripts/writeBranchingScript";
import { writeScript } from "@/server/services/scripts/writeScript";
import { addSoundCues } from "@/server/services/sounds/addSoundCues";
import { pickAmbience } from "@/server/services/sounds/pickAmbience";
import { castCharacters } from "@/server/services/voices/castCharacters";
import { describeCharacters } from "@/server/services/voices/describeCharacters";
import type { DraftLine } from "@/types/DraftLine";
import { Script } from "@/types/Script";
import type { ScriptFormat } from "@/types/ScriptFormat";
import type { ScriptSource } from "@/types/ScriptSource";

export async function createScript(source: ScriptSource, format: ScriptFormat) {
  if (format === "interactive") {
    return createInteractiveScript(await getMaterial(source));
  }
  const writableSource = source.kind === "link" ? { kind: "text" as const, text: await getMaterial(source) } : source;
  const draft = await writeScript(writableSource, format);
  const isAudiobook = format === "audiobook";
  const cues = isAudiobook
    ? addSoundCues(draft.lines)
    : draft.lines.map((line) => ({ kind: "speech" as const, ...line }));
  return Script.parse({
    id: crypto.randomUUID(),
    title: draft.title,
    format,
    ambience: isAudiobook ? pickAmbience(joinText(draft.lines)) : undefined,
    cast: castCharacters(getSpeakers(draft.lines), await describeCharacters(draft.lines)),
    firstSceneId: "main",
    scenes: [{ id: "main", title: draft.title, cues, choices: [] }],
  });
}

async function createInteractiveScript(material: string) {
  const story = await writeBranchingScript(material);
  const allLines = story.scenes.flatMap((scene) => scene.lines);
  const scenes = story.scenes.map(({ plan, lines }) => ({
    id: plan.id,
    title: plan.title,
    cues: addSoundCues(lines),
    question: plan.question,
    choices: plan.choices,
    ending: plan.ending,
  }));
  return Script.parse({
    id: crypto.randomUUID(),
    title: story.title,
    format: "interactive",
    ambience: pickAmbience(joinText(allLines)),
    cast: castCharacters(getSpeakers(allLines), await describeCharacters(allLines)),
    firstSceneId: "opening",
    scenes,
  });
}

async function getMaterial(source: ScriptSource) {
  if (source.kind === "link") {
    const page = await readPage(source.url);
    return page.text;
  }
  return source.kind === "text" ? source.text : source.idea;
}

function getSpeakers(lines: DraftLine[]) {
  return [...new Set(lines.map((line) => line.speaker))];
}

function joinText(lines: DraftLine[]) {
  return lines.map((line) => line.text).join(" ");
}
