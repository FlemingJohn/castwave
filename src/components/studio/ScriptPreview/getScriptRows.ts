import { describeVoice } from "@/services/speech/describeVoice";
import { toDisplayName } from "@/services/text/toDisplayName";
import type { Choice } from "@/types/Choice";
import type { Cue } from "@/types/Cue";
import type { Script } from "@/types/Script";
import type { ScriptRow } from "./ScriptRow";

export function getScriptRows(script: Script, choicesMade: Choice[]): ScriptRow[] {
  const sceneIds = [script.firstSceneId, ...choicesMade.map((choice) => choice.nextSceneId)];
  return sceneIds.flatMap((sceneId, sceneNumber) => {
    const scene = script.scenes.find((candidate) => candidate.id === sceneId);
    const chosen = choicesMade[sceneNumber - 1];
    const rows = (scene ? scene.cues : []).map((cue) => toRow(script, cue));
    const firstRow = rows[0];
    if (firstRow && chosen) {
      firstRow.heading = `You chose: ${chosen.label}`;
    }
    return rows;
  });
}

function toRow(script: Script, cue: Cue): ScriptRow {
  if (cue.kind === "sound") {
    const performanceLine = { kind: "sound" as const, sound: cue.sound, startsParagraph: cue.startsParagraph };
    return { label: "Sound effect", detail: toDisplayName(cue.sound), text: cue.description, colourNumber: 0, performanceLine };
  }
  const castNames = script.cast.map((character) => character.name);
  const character = script.cast.find((member) => member.name === cue.speaker);
  const voice = character ? character.voice : "george";
  const performanceLine = { kind: "speech" as const, text: cue.text, voice, startsParagraph: cue.startsParagraph };
  const colourNumber = (castNames.indexOf(cue.speaker) % 6) + 1;
  return { label: cue.speaker, detail: describeVoice(voice).name, text: cue.text, colourNumber, performanceLine };
}
