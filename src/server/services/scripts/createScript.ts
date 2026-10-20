import "server-only";
import { NotBuiltYetError } from "@/server/errors/NotBuiltYetError";
import { readPage } from "@/server/services/pages/readPage";
import { writeScript } from "@/server/services/scripts/writeScript";
import { addSoundCues } from "@/server/services/sounds/addSoundCues";
import { pickAmbience } from "@/server/services/sounds/pickAmbience";
import { castCharacters } from "@/server/services/voices/castCharacters";
import { Script } from "@/types/Script";
import type { ScriptFormat } from "@/types/ScriptFormat";
import type { ScriptSource } from "@/types/ScriptSource";

export async function createScript(source: ScriptSource, format: ScriptFormat) {
  if (format === "interactive") {
    throw new NotBuiltYetError("Interactive stories");
  }
  const writableSource = source.kind === "link" ? { kind: "text" as const, text: (await readPage(source.url)).text } : source;
  const draft = await writeScript(writableSource, format);
  const speakers = [...new Set(draft.lines.map((line) => line.speaker))];
  const isAudiobook = format === "audiobook";
  const cues = isAudiobook ? addSoundCues(draft.lines) : draft.lines.map((line) => ({ kind: "speech" as const, ...line }));
  const storyText = draft.lines.map((line) => line.text).join(" ");
  return Script.parse({
    title: draft.title,
    format,
    ambience: isAudiobook ? pickAmbience(storyText) : undefined,
    cast: castCharacters(speakers),
    firstSceneId: "main",
    scenes: [{ id: "main", title: draft.title, cues, choices: [] }],
  });
}
