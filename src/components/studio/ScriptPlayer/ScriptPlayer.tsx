"use client";

import { Fragment, useEffect, useState } from "react";
import { CastStrip } from "@/components/studio/CastStrip/CastStrip";
import { ChoiceCard } from "@/components/studio/ChoiceCard/ChoiceCard";
import { CueRow } from "@/components/studio/CueRow/CueRow";
import { EndingCard } from "@/components/studio/EndingCard/EndingCard";
import { PlaybackControls } from "@/components/studio/PlaybackControls/PlaybackControls";
import { SceneStage } from "@/components/studio/SceneStage/SceneStage";
import { getScriptRows } from "@/components/studio/ScriptPreview/getScriptRows";
import { usePerformance } from "@/components/studio/ScriptPreview/usePerformance";
import { usePictures } from "@/hooks/usePictures";
import type { Choice } from "@/types/Choice";
import type { VoiceName } from "@/types/VoiceName";
import type { ScriptPlayerProps } from "./ScriptPlayerProps";
import { getStageView } from "./getStageView";
import styles from "./ScriptPlayer.module.css";

export function ScriptPlayer(props: ScriptPlayerProps) {
  const { script, job, pictureJob } = props;
  usePictures(pictureJob);
  const [choicesMade, setChoicesMade] = useState<Choice[]>([]);
  const [foundEndingIds, setFoundEndingIds] = useState<string[]>([]);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const performance = usePerformance(job, script.ambience);
  const rows = getScriptRows(script, choicesMade);
  const lines = rows.map((row) => row.performanceLine);
  const visitedSceneIds = [script.firstSceneId, ...choicesMade.map((choice) => choice.nextSceneId)];
  const currentScene = script.scenes.find((scene) => scene.id === visitedSceneIds.at(-1));
  const hasHeardScene = performance.status === "finished";
  const isPlaying = performance.status === "playing" || performance.status === "paused";
  const stage = getStageView(
    rows,
    performance.snapshot.playingPosition,
    visitedSceneIds.at(-1) ?? script.firstSceneId,
    isPlaying,
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (job.takeAutoplay()) {
        performance.play(
          getScriptRows(script, []).map((row) => row.performanceLine),
          0,
        );
      }
    });
    return () => clearTimeout(timer);
  }, []);

  function changeVoice(characterName: string, voice: VoiceName) {
    performance.stop();
    const cast = script.cast.map((character) =>
      character.name === characterName ? { ...character, voice } : character,
    );
    const changed = { ...script, cast };
    props.onScriptChange(changed);
    void job.revoice(changed, characterName);
  }

  function choose(choice: Choice) {
    const nextChoices = [...choicesMade, choice];
    setChoicesMade(nextChoices);
    performance.play(
      getScriptRows(script, nextChoices).map((row) => row.performanceLine),
      rows.length,
    );
  }

  function restart() {
    performance.stop();
    if (currentScene?.ending && !foundEndingIds.includes(currentScene.id)) {
      setFoundEndingIds([...foundEndingIds, currentScene.id]);
    }
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
      {script.showcase && <span className={styles.showcase}>Showcase · voiced earlier by AssemblyAI</span>}
      <CastStrip cast={script.cast} onVoiceChange={changeVoice} />
      <PlaybackControls
        status={performance.status}
        playingPosition={performance.snapshot.playingPosition}
        lineCount={rows.length}
        onPlay={() => performance.play(lines, 0)}
        onPause={() => void performance.pause()}
        onResume={() => void performance.resume()}
        onStop={performance.stop}
      />
      {stage.row && (
        <SceneStage
          sceneId={stage.row.sceneId}
          picture={pictureJob.getPicture(stage.row.sceneId)}
          ambience={script.ambience}
          speaker={stage.row.label}
          text={stage.row.text}
          colourNumber={stage.row.colourNumber}
          isSound={stage.row.performanceLine.kind === "sound"}
          isPlaying={isPlaying}
          spokenWordCount={performance.snapshot.spokenWordCount}
          effect={stage.effect}
          readVoiceLevel={performance.readVoiceLevel}
        />
      )}
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
              status={performance.snapshot.statuses[position] ?? "ready"}
              spokenWordCount={
                position === performance.snapshot.playingPosition ? performance.snapshot.spokenWordCount : 0
              }
              onPlay={() => performance.play(lines, position)}
            />
          </Fragment>
        ))}
      </ol>
      {hasHeardScene && currentScene?.question && (
        <ChoiceCard
          key={currentScene.id}
          question={currentScene.question}
          choices={currentScene.choices}
          isVoiceMode={isVoiceMode}
          onVoiceModeChange={setIsVoiceMode}
          onChoose={choose}
        />
      )}
      {hasHeardScene && currentScene?.ending && (
        <EndingCard
          script={script}
          endingTitle={currentScene.ending}
          getPicture={(sceneId) => pictureJob.getPicture(sceneId)}
          visitedSceneIds={visitedSceneIds}
          foundEndingIds={[...new Set([...foundEndingIds, currentScene.id])]}
          onRestart={restart}
        />
      )}
    </section>
  );
}
