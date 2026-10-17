"use client";

import Link from "next/link";
import { useState } from "react";
import { CastStrip } from "@/components/studio/CastStrip/CastStrip";
import { CueRow } from "@/components/studio/CueRow/CueRow";
import { ErrorNote } from "@/components/ui/ErrorNote/ErrorNote";
import { useSpokenLine } from "@/hooks/useSpokenLine";
import { useStoredScript } from "@/hooks/useStoredScript";
import styles from "./ScriptPreview.module.css";

export function ScriptPreview() {
  const { script, hasLoaded } = useStoredScript();
  const spokenLine = useSpokenLine();
  const [playingPosition, setPlayingPosition] = useState(-1);

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

  const scene = script.scenes.find((candidate) => candidate.id === script.firstSceneId);
  const castNames = script.cast.map((character) => character.name);
  return (
    <section className={styles.card} aria-labelledby="script-title">
      <div className={styles.header}>
        <h2 id="script-title" className={styles.title}>
          {script.title}
        </h2>
        <span className={styles.format}>{script.format}</span>
      </div>
      <CastStrip cast={script.cast} />
      {spokenLine.errorMessage && <ErrorNote message={spokenLine.errorMessage} />}
      <ol className={styles.cues}>
        {scene?.cues.map((cue, position) => {
          if (cue.kind !== "speech") {
            return null;
          }
          const character = script.cast.find((member) => member.name === cue.speaker);
          const voice = character ? character.voice : "george";
          return (
            <CueRow
              key={position}
              speaker={cue.speaker}
              voice={voice}
              text={cue.text}
              colourNumber={(castNames.indexOf(cue.speaker) % 6) + 1}
              startsParagraph={cue.startsParagraph && position > 0}
              isPlaying={playingPosition === position && spokenLine.status === "speaking"}
              onPlay={() => {
                setPlayingPosition(position);
                void spokenLine.speak(cue.text, voice);
              }}
            />
          );
        })}
      </ol>
    </section>
  );
}
