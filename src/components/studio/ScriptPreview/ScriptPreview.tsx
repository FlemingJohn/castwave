"use client";

import Link from "next/link";
import { Fragment, useState } from "react";
import { WaitingForScript } from "@/components/illustrations/WaitingForScript/WaitingForScript";
import { CastStrip } from "@/components/studio/CastStrip/CastStrip";
import { ChoiceCard } from "@/components/studio/ChoiceCard/ChoiceCard";
import { CueRow } from "@/components/studio/CueRow/CueRow";
import { EndingCard } from "@/components/studio/EndingCard/EndingCard";
import { PlaybackControls } from "@/components/studio/PlaybackControls/PlaybackControls";
import { ErrorNote } from "@/components/ui/ErrorNote/ErrorNote";
import { useStoredScript } from "@/hooks/useStoredScript";
import type { Choice } from "@/types/Choice";
import type { VoiceName } from "@/types/VoiceName";
import { getScriptRows } from "./getScriptRows";
import { usePerformance } from "./usePerformance";
import styles from "./ScriptPreview.module.css";

export function ScriptPreview() {
  const { script, hasLoaded, saveScript } = useStoredScript();
  const [choicesMade, setChoicesMade] = useState<Choice[]>([]);
  const performance = usePerformance(script?.ambience);

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

  const rows = getScriptRows(script, choicesMade);
  const lines = rows.map((row) => row.performanceLine);
  const currentSceneId = choicesMade.at(-1)?.nextSceneId ?? script.firstSceneId;
  const currentScene = script.scenes.find((scene) => scene.id === currentSceneId);
  const hasHeardScene = performance.status === "finished";
  const endingCount = script.scenes.filter((scene) => scene.ending).length;

  function changeVoice(characterName: string, voice: VoiceName) {
    if (!script) {
      return;
    }
    performance.stop();
    const cast = script.cast.map((character) => (character.name === characterName ? { ...character, voice } : character));
    saveScript({ ...script, cast });
  }

  function choose(choice: Choice) {
    if (!script) {
      return;
    }
    const nextChoices = [...choicesMade, choice];
    const nextLines = getScriptRows(script, nextChoices).map((row) => row.performanceLine);
    setChoicesMade(nextChoices);
    void performance.play(nextLines, rows.length);
  }

  function restart() {
    performance.stop();
    setChoicesMade([]);
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
        onPlay={() => void performance.play(lines, 0)}
        onPause={() => void performance.pause()}
        onResume={() => void performance.resume()}
        onStop={performance.stop}
      />
      {performance.errorMessage && <ErrorNote message={performance.errorMessage} />}
      <ol className={styles.cues}>
        {rows.map((row, position) => (
          <Fragment key={position}>
            {row.heading && <li className={styles.heading}>{row.heading}</li>}
            <CueRow
              speaker={row.label}
              voice={row.detail}
              text={row.text}
              isSound={row.performanceLine.kind === "sound"}
              colourNumber={row.colourNumber}
              startsParagraph={row.performanceLine.startsParagraph && position > 0 && !row.heading}
              status={performance.snapshot.statuses[position] ?? "waiting"}
              spokenWordCount={position === performance.snapshot.playingPosition ? performance.snapshot.spokenWordCount : 0}
              onPlay={() => void performance.play(lines, position)}
            />
          </Fragment>
        ))}
      </ol>
      {hasHeardScene && currentScene?.question && (
        <ChoiceCard question={currentScene.question} choices={currentScene.choices} onChoose={choose} />
      )}
      {hasHeardScene && currentScene?.ending && (
        <EndingCard endingTitle={currentScene.ending} endingCount={endingCount} onRestart={restart} />
      )}
    </section>
  );
}
