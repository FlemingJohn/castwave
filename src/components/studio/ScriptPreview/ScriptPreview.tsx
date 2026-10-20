"use client";

import Link from "next/link";
import { CastStrip } from "@/components/studio/CastStrip/CastStrip";
import { CueRow } from "@/components/studio/CueRow/CueRow";
import { WaitingForScript } from "@/components/illustrations/WaitingForScript/WaitingForScript";
import { PlaybackControls } from "@/components/studio/PlaybackControls/PlaybackControls";
import { ErrorNote } from "@/components/ui/ErrorNote/ErrorNote";
import { useStoredScript } from "@/hooks/useStoredScript";
import { describeVoice } from "@/services/speech/describeVoice";
import { toDisplayName } from "@/services/text/toDisplayName";
import type { Script } from "@/types/Script";
import type { VoiceName } from "@/types/VoiceName";
import type { PerformanceLine } from "./PerformanceLine";
import { usePerformance } from "./usePerformance";
import styles from "./ScriptPreview.module.css";

export function ScriptPreview() {
  const { script, hasLoaded, saveScript } = useStoredScript();
  const rows = script ? getRows(script) : [];
  const performance = usePerformance(
    rows.map((row) => row.performanceLine),
    script?.ambience,
  );

  if (!hasLoaded) {
    return null;
  }
  if (!script) {
    return (
      <section className={styles.empty}>
        <WaitingForScript />
        <p>No script yet.</p>
        <Link href="/">Create one from a story, a link or an idea</Link>
      </section>
    );
  }

  function changeVoice(characterName: string, voice: VoiceName) {
    if (!script) {
      return;
    }
    performance.stop();
    const cast = script.cast.map((character) => (character.name === characterName ? { ...character, voice } : character));
    saveScript({ ...script, cast });
  }

  return (
    <section className={styles.card} aria-labelledby="script-title">
      <div className={styles.header}>
        <h2 id="script-title" className={styles.title}>
          {script.title}
        </h2>
        <span className={styles.format}>
          {script.format}
          {script.ambience ? ` · ${script.ambience} in the background` : ""}
        </span>
      </div>
      <CastStrip cast={script.cast} onVoiceChange={changeVoice} />
      <PlaybackControls
        status={performance.status}
        playingPosition={performance.snapshot.playingPosition}
        lineCount={rows.length}
        onPlay={() => void performance.play(0)}
        onPause={() => void performance.pause()}
        onResume={() => void performance.resume()}
        onStop={performance.stop}
      />
      {performance.errorMessage && <ErrorNote message={performance.errorMessage} />}
      <ol className={styles.cues}>
        {rows.map((row, position) => (
          <CueRow
            key={position}
            speaker={row.label}
            voice={row.detail}
            text={row.text}
            isSound={row.performanceLine.kind === "sound"}
            colourNumber={row.colourNumber}
            startsParagraph={row.performanceLine.startsParagraph && position > 0}
            status={performance.snapshot.statuses[position] ?? "waiting"}
            spokenWordCount={position === performance.snapshot.playingPosition ? performance.snapshot.spokenWordCount : 0}
            onPlay={() => void performance.play(position)}
          />
        ))}
      </ol>
    </section>
  );
}

type Row = {
  label: string;
  detail: string;
  text: string;
  colourNumber: number;
  performanceLine: PerformanceLine;
};

function getRows(script: Script): Row[] {
  const scene = script.scenes.find((candidate) => candidate.id === script.firstSceneId);
  const castNames = script.cast.map((character) => character.name);
  return (scene ? scene.cues : []).map((cue) => {
    if (cue.kind === "sound") {
      const performanceLine = { kind: "sound" as const, sound: cue.sound, startsParagraph: cue.startsParagraph };
      return { label: "Sound effect", detail: toDisplayName(cue.sound), text: cue.description, colourNumber: 0, performanceLine };
    }
    const character = script.cast.find((member) => member.name === cue.speaker);
    const voice = character ? character.voice : "george";
    const performanceLine = { kind: "speech" as const, text: cue.text, voice, startsParagraph: cue.startsParagraph };
    const colourNumber = (castNames.indexOf(cue.speaker) % 6) + 1;
    return { label: cue.speaker, detail: describeVoice(voice).name, text: cue.text, colourNumber, performanceLine };
  });
}
