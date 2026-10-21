import { useEffect, useRef, useState } from "react";
import { RainLayer } from "@/components/studio/RainLayer/RainLayer";
import { SpeakerWave } from "@/components/studio/SpeakerWave/SpeakerWave";
import { CharacterAvatar } from "@/components/ui/CharacterAvatar/CharacterAvatar";
import { animateCueEffect } from "@/services/visuals/animateCueEffect";
import type { SceneStageProps } from "./SceneStageProps";
import styles from "./SceneStage.module.css";

type PictureLayer = { sceneId: string; url: string };

export function SceneStage(props: SceneStageProps) {
  const pictureRef = useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState<PictureLayer[]>([]);
  const top = layers.at(-1);
  if (props.picture && (top?.sceneId !== props.sceneId || top.url !== props.picture)) {
    setLayers([...layers.slice(-1), { sceneId: props.sceneId, url: props.picture }]);
  }

  useEffect(() => {
    const element = pictureRef.current;
    if (!element || !props.effect) {
      return;
    }
    return animateCueEffect(element, props.effect.kind);
  }, [props.effect?.position, props.effect?.kind]);

  const words = props.text.split(/\s+/);
  return (
    <figure className={styles.stage} data-ambience={props.ambience ?? "none"}>
      <div className={styles.screen}>
        <div ref={pictureRef} className={styles.picture}>
          {layers.map((layer) => (
            <img key={`${layer.sceneId}-${layer.url.length}`} className={styles.layer} src={layer.url} alt="" />
          ))}
        </div>
        {props.ambience === "rain" && <RainLayer />}
        <div className={styles.shade} />
        <figcaption className={styles.line} data-sound={props.isSound}>
          {props.isPlaying && props.previousText && <span className={styles.previous}>{props.previousText}</span>}
          <span className={styles.who} data-colour={props.isSound ? 0 : props.colourNumber}>
            {props.isSound ? "Sound effect" : props.speaker}
          </span>
          <span className={styles.current}>
            {words.map((word, position) => (
              <span
                key={position}
                className={!props.isPlaying || position < props.spokenWordCount ? styles.spoken : styles.ahead}
              >
                {word}{" "}
              </span>
            ))}
          </span>
        </figcaption>
      </div>
      <div className={styles.voice}>
        <span className={styles.speaker}>
          <CharacterAvatar
            kind={props.isSound ? "sound" : props.speaker === "Narrator" ? "narrator" : "character"}
            initial={props.speaker.slice(0, 1)}
            colourNumber={props.colourNumber}
            size={32}
            isLive={props.isPlaying && !props.isSound}
          />
          <span className={styles.name}>{props.speaker}</span>
        </span>
        <SpeakerWave colourNumber={props.colourNumber} readLevel={props.readVoiceLevel} />
      </div>
    </figure>
  );
}
