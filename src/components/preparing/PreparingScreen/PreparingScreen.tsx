import { CastRings } from "@/components/preparing/CastRings/CastRings";
import { PreparingStep } from "@/components/preparing/PreparingStep/PreparingStep";
import { StoryMap } from "@/components/preparing/StoryMap/StoryMap";
import { VoiceWave } from "@/components/preparing/VoiceWave/VoiceWave";
import { Button } from "@/components/ui/Button/Button";
import { ErrorNote } from "@/components/ui/ErrorNote/ErrorNote";
import { Icon } from "@/components/ui/Icon/Icon";
import { usePictures } from "@/hooks/usePictures";
import type { PreparingScreenProps } from "./PreparingScreenProps";
import { getPreparingSteps } from "./getPreparingSteps";
import styles from "./PreparingScreen.module.css";

const LINES_BEFORE_PLAY_NOW = 8;

export function PreparingScreen(props: PreparingScreenProps) {
  const { script, progress } = props;
  const pictures = usePictures(props.pictureJob);
  const steps = getPreparingSteps(script, progress, pictures);
  const cover = script ? props.pictureJob?.getPicture(script.firstSceneId) : undefined;
  const opening = progress?.scenes.find((scene) => scene.id === script?.firstSceneId);
  const isReady = progress?.status === "ready";
  const canPlayNow =
    !isReady && opening !== undefined && opening.done >= Math.min(opening.total, LINES_BEFORE_PLAY_NOW);
  const share = progress && progress.linesTotal > 0 ? progress.linesDone / progress.linesTotal : 0;
  return (
    <section className={styles.card} aria-labelledby="preparing-title" aria-live="polite">
      <div className={styles.hero} data-cover={Boolean(cover)}>
        {cover && <img className={styles.cover} src={cover} alt="" />}
        <div className={styles.head}>
          <div>
            <span className={styles.label}>Getting your performance ready</span>
            <h1 id="preparing-title" className={styles.title}>
              {script ? script.title : "Writing your script…"}
            </h1>
          </div>
          {script && <span className={styles.format}>{script.format}</span>}
        </div>
      </div>
      <div className={styles.columns}>
        <ol className={styles.steps}>
          {steps.map((step) => (
            <PreparingStep key={step.title} {...step}>
              {step.icon === "image" && pictures && (
                <div className={styles.progress}>
                  <div className={styles.track}>
                    <div
                      className={styles.fill}
                      style={{ width: `${(pictures.done / Math.max(1, pictures.total)) * 100}%` }}
                    />
                  </div>
                  <div className={styles.numbers}>
                    <span>
                      {pictures.done} of {pictures.total} pictures
                    </span>
                  </div>
                </div>
              )}
              {step.icon === "wave" && progress && (
                <div className={styles.progress}>
                  <div className={styles.track}>
                    <div className={styles.fill} style={{ width: `${share * 100}%` }} />
                  </div>
                  <div className={styles.numbers}>
                    <span>
                      {progress.linesDone} of {progress.linesTotal} lines
                    </span>
                    <span>{Math.round(progress.audioSeconds)} s of audio</span>
                  </div>
                </div>
              )}
            </PreparingStep>
          ))}
        </ol>
        <div className={styles.side}>
          <div className={styles.panel}>
            <span className={styles.label}>Cast · lines voiced</span>
            {script ? (
              <CastRings cast={script.cast} progress={progress} />
            ) : (
              <p className={styles.quiet}>The cast appears once the script is written.</p>
            )}
          </div>
          <div className={styles.panel}>
            <span className={styles.label}>
              {progress?.status === "voicing" ? "Voices being made right now" : "Voices"}
            </span>
            <VoiceWave isActive={progress?.status === "voicing"} />
          </div>
        </div>
      </div>
      {script && script.scenes.length > 1 && (
        <div className={styles.panel}>
          <span className={styles.label}>Story map · no spoilers: scenes unlock as you play</span>
          <StoryMap
            scenes={script.scenes}
            firstSceneId={script.firstSceneId}
            progress={progress}
            visitedSceneIds={[]}
            foundEndingIds={[]}
          />
        </div>
      )}
      {progress?.status === "failed" && <ErrorNote message={`Voicing stopped: ${progress.errorMessage}`} />}
      <div className={styles.actions}>
        <Button look="primary" onClick={props.onOpen} isDisabled={!isReady}>
          <Icon name="play" />
          {isReady ? props.openLabel : "Getting ready…"}
        </Button>
        {canPlayNow && (
          <Button look="plain" onClick={props.onPlayNow}>
            <Icon name="play" />
            Play now
          </Button>
        )}
        <p className={styles.quiet}>
          {canPlayNow
            ? "The opening is voiced. Play now, and the rest keeps voicing while you listen."
            : "Every line is voiced before you play, so play, choices and replays start instantly."}
        </p>
      </div>
    </section>
  );
}
