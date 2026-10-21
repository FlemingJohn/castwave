"use client";

import { useEffect, useRef, useState } from "react";
import { CastStrip } from "@/components/studio/CastStrip/CastStrip";
import { ChoiceCard } from "@/components/studio/ChoiceCard/ChoiceCard";
import { EndingCard } from "@/components/studio/EndingCard/EndingCard";
import { EndingOverlay } from "@/components/studio/EndingOverlay/EndingOverlay";
import { PlaybackControls } from "@/components/studio/PlaybackControls/PlaybackControls";
import { SceneProgress } from "@/components/studio/SceneProgress/SceneProgress";
import { SceneStage } from "@/components/studio/SceneStage/SceneStage";
import { ScriptLines } from "@/components/studio/ScriptLines/ScriptLines";
import { getScriptRows } from "@/components/studio/ScriptPreview/getScriptRows";
import { usePerformance } from "@/components/studio/ScriptPreview/usePerformance";
import { StudioTopBar } from "@/components/studio/StudioTopBar/StudioTopBar";
import { useFollowPlayingLine } from "@/hooks/useFollowPlayingLine";
import { usePictures } from "@/hooks/usePictures";
import { useScriptBeside } from "@/hooks/useScriptBeside";
import type { Choice } from "@/types/Choice";
import type { VoiceName } from "@/types/VoiceName";
import type { ScriptPlayerProps } from "./ScriptPlayerProps";
import { countSceneLevels } from "./countSceneLevels";
import { getStageView } from "./getStageView";
import styles from "./ScriptPlayer.module.css";

export function ScriptPlayer(props: ScriptPlayerProps) {
  const { script, job, pictureJob } = props;
  usePictures(pictureJob);
  const beside = useScriptBeside();
  const panelRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<HTMLDivElement>(null);
  const [isCastOpen, setIsCastOpen] = useState(false);
  const [choicesMade, setChoicesMade] = useState<Choice[]>([]);
  const [foundEndingIds, setFoundEndingIds] = useState<string[]>([]);
  const performance = usePerformance(job, script.ambience);
  const rows = getScriptRows(script, choicesMade);
  const lines = rows.map((row) => row.performanceLine);
  const visitedSceneIds = [script.firstSceneId, ...choicesMade.map((choice) => choice.nextSceneId)];
  const currentScene = script.scenes.find((scene) => scene.id === visitedSceneIds.at(-1));
  const hasHeardScene = performance.status === "finished";
  const isPlaying = performance.status === "playing" || performance.status === "paused";
  const currentSceneId = visitedSceneIds.at(-1) ?? script.firstSceneId;
  const stage = getStageView(rows, performance.snapshot.playingPosition, currentSceneId, isPlaying, hasHeardScene);
  const allFound = currentScene?.ending ? [...new Set([...foundEndingIds, currentScene.id])] : foundEndingIds;
  useFollowPlayingLine(panelRef, performance.snapshot.playingPosition);

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
    setFoundEndingIds(allFound);
    setChoicesMade([]);
  }

  const overlay =
    hasHeardScene && currentScene?.question ? (
      <ChoiceCard
        key={currentScene.id}
        question={currentScene.question}
        choices={currentScene.choices}
        onChoose={choose}
      />
    ) : hasHeardScene && currentScene?.ending ? (
      <EndingOverlay
        endingTitle={currentScene.ending}
        foundCount={allFound.length}
        endingCount={script.scenes.filter((scene) => scene.ending).length}
        onRestart={restart}
        onShowPath={() => pathRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
      />
    ) : undefined;

  return (
    <section className={styles.player} aria-labelledby="script-title">
      <StudioTopBar
        script={script}
        isCastOpen={isCastOpen}
        isBeside={beside.isBeside}
        onToggleCast={() => setIsCastOpen(!isCastOpen)}
        onToggleBeside={beside.toggle}
        onPickShowcase={props.onPickShowcase}
      />
      {isCastOpen && <CastStrip cast={script.cast} onVoiceChange={changeVoice} />}
      <div className={styles.playbar}>
        <PlaybackControls
          status={performance.status}
          playingPosition={performance.snapshot.playingPosition}
          lineCount={rows.length}
          onPlay={() => performance.play(lines, 0)}
          onPause={() => void performance.pause()}
          onResume={() => void performance.resume()}
          onStop={performance.stop}
        />
        {script.format === "interactive" && (
          <SceneProgress current={visitedSceneIds.length} total={countSceneLevels(script)} />
        )}
      </div>
      <div className={styles.layout} data-beside={beside.isBeside}>
        {stage.row && (
          <SceneStage
            sceneId={stage.row.sceneId}
            picture={pictureJob.getPicture(stage.row.sceneId)}
            ambience={script.ambience}
            speaker={stage.row.label}
            text={stage.row.text}
            previousText={stage.previousText}
            colourNumber={stage.row.colourNumber}
            isSound={stage.row.performanceLine.kind === "sound"}
            isPlaying={isPlaying}
            spokenWordCount={performance.snapshot.spokenWordCount}
            effect={stage.effect}
            readVoiceLevel={performance.readVoiceLevel}
            overlay={overlay}
          />
        )}
        {beside.isBeside && (
          <div ref={panelRef} className={styles.panel} aria-label="Script">
            <ScriptLines
              rows={rows}
              snapshot={performance.snapshot}
              onPlay={(position) => performance.play(lines, position)}
            />
            {currentScene?.question && !hasHeardScene && (
              <p className={styles.nextChoice}>Your next choice appears here and in the scene when this scene ends.</p>
            )}
          </div>
        )}
      </div>
      {!beside.isBeside && (
        <details className={styles.drawer}>
          <summary>Show the script · {rows.length} lines</summary>
          <ScriptLines
            rows={rows}
            snapshot={performance.snapshot}
            onPlay={(position) => performance.play(lines, position)}
          />
        </details>
      )}
      {hasHeardScene && currentScene?.ending && (
        <div ref={pathRef}>
          <EndingCard
            script={script}
            endingTitle={currentScene.ending}
            getPicture={(sceneId) => pictureJob.getPicture(sceneId)}
            visitedSceneIds={visitedSceneIds}
            foundEndingIds={allFound}
            onRestart={restart}
          />
        </div>
      )}
    </section>
  );
}
