import type { ScriptRow } from "@/components/studio/ScriptPreview/ScriptRow";
import type { CueEffect } from "@/types/CueEffect";

const EFFECTS: CueEffect[] = ["thunder", "door_slam", "heartbeat"];

export function getStageView(
  rows: ScriptRow[],
  playingPosition: number,
  currentSceneId: string,
  isPlaying: boolean,
  hasFinished: boolean,
) {
  const playingRow = isPlaying ? rows[playingPosition] : undefined;
  const sceneRows = rows.filter((candidate) => candidate.sceneId === currentSceneId);
  const restingRow = hasFinished
    ? sceneRows.findLast((candidate) => candidate.performanceLine.kind === "speech")
    : sceneRows[0];
  const row = playingRow ?? restingRow ?? rows[0];
  const line = playingRow?.performanceLine;
  const effect = line?.kind === "sound" ? EFFECTS.find((name) => name === line.sound) : undefined;
  const previousRow = playingRow ? rows[playingPosition - 1] : undefined;
  const previousText =
    previousRow && previousRow.performanceLine.kind === "speech" && previousRow.sceneId === row?.sceneId
      ? previousRow.text
      : "";
  return { row, previousText, effect: effect ? { kind: effect, position: playingPosition } : null };
}
