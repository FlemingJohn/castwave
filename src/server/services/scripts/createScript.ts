import "server-only";
import { NotBuiltYetError } from "@/server/errors/NotBuiltYetError";
import { writeScript } from "@/server/services/scripts/writeScript";
import { castCharacters } from "@/server/services/voices/castCharacters";
import { Script } from "@/types/Script";
import type { ScriptFormat } from "@/types/ScriptFormat";
import type { ScriptSource } from "@/types/ScriptSource";

export async function createScript(source: ScriptSource, format: ScriptFormat) {
  if (source.kind === "link") {
    throw new NotBuiltYetError("Reading web pages");
  }
  if (format === "interactive") {
    throw new NotBuiltYetError("Interactive stories");
  }
  const draft = await writeScript(source, format);
  const speakers = [...new Set(draft.lines.map((line) => line.speaker))];
  const cues = draft.lines.map((line) => ({ kind: "speech" as const, ...line }));
  return Script.parse({
    title: draft.title,
    format,
    cast: castCharacters(speakers),
    firstSceneId: "main",
    scenes: [{ id: "main", title: draft.title, cues, choices: [] }],
  });
}
