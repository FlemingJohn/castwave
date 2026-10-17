"use client";

import Link from "next/link";
import { CastStrip } from "@/components/studio/CastStrip/CastStrip";
import { CueRow } from "@/components/studio/CueRow/CueRow";
import { PlaybackControls } from "@/components/studio/PlaybackControls/PlaybackControls";
import { ErrorNote } from "@/components/ui/ErrorNote/ErrorNote";
import { useStoredScript } from "@/hooks/useStoredScript";
import type { Script } from "@/types/Script";
import type { PerformanceLine } from "./PerformanceLine";
import { usePerformance } from "./usePerformance";
import styles from "./ScriptPreview.module.css";

export function ScriptPreview() {
  const { script, hasLoaded } = useStoredScript();
  const lines = script ? getSpokenLines(script) : [];
  const performance = usePerformance(lines.map((line) => line.performanceLine));

  if (!hasLoaded) {
    return null;
  }
  if (!script) {
    return (
      <section className={styles.empty}>
        <p>No script yet.</p>
        <Link href="/">Create one from a story, a link or an idea</Link>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-labelledby="script-title">
      <div className={styles.header}>
        <h2 id="script-title" className={styles.title}>
          {script.title}
        </h2>
        <span className={styles.format}>{script.format}</span>
      </div>
      <CastStrip cast={script.cast} />
      <PlaybackControls
        status={performance.status}
        playingPosition={performance.snapshot.playingPosition}
        lineCount={lines.length}
        onPlay={() => void performance.play(0)}
        onPause={() => void performance.pause()}
        onResume={() => void performance.resume()}
        onStop={performance.stop}
      />
      {performance.errorMessage && <ErrorNote message={performance.errorMessage} />}
      <ol className={styles.cues}>
        {lines.map((line, position) => (
          <CueRow
            key={position}
            speaker={line.speaker}
            voice={line.performanceLine.voice}
            text={line.performanceLine.text}
            colourNumber={line.colourNumber}
            startsParagraph={line.performanceLine.startsParagraph && position > 0}
            status={performance.snapshot.statuses[position] ?? "waiting"}
            spokenWordCount={position === performance.snapshot.playingPosition ? performance.snapshot.spokenWordCount : 0}
            onPlay={() => void performance.play(position)}
          />
        ))}
      </ol>
    </section>
  );
}

type SpokenLine = {
  speaker: string;
  colourNumber: number;
  performanceLine: PerformanceLine;
};

function getSpokenLines(script: Script): SpokenLine[] {
  const scene = script.scenes.find((candidate) => candidate.id === script.firstSceneId);
  const castNames = script.cast.map((character) => character.name);
  const spokenLines: SpokenLine[] = [];
  for (const cue of scene ? scene.cues : []) {
    if (cue.kind !== "speech") {
      continue;
    }
    const character = script.cast.find((member) => member.name === cue.speaker);
    spokenLines.push({
      speaker: cue.speaker,
      colourNumber: (castNames.indexOf(cue.speaker) % 6) + 1,
      performanceLine: { text: cue.text, voice: character ? character.voice : "george", startsParagraph: cue.startsParagraph },
    });
  }
  return spokenLines;
}
