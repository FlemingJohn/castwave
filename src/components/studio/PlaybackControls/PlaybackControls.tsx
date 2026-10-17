import { Button } from "@/components/ui/Button/Button";
import type { PlaybackControlsProps } from "./PlaybackControlsProps";
import styles from "./PlaybackControls.module.css";

export function PlaybackControls(props: PlaybackControlsProps) {
  const mainAction = {
    idle: { label: "Play the whole script", onClick: props.onPlay },
    starting: { label: "Opening voices…", onClick: undefined },
    playing: { label: "Pause", onClick: props.onPause },
    paused: { label: "Resume", onClick: props.onResume },
    finished: { label: "Play again", onClick: props.onPlay },
    failed: { label: "Try again", onClick: props.onPlay },
  }[props.status];
  const isActive = props.status === "playing" || props.status === "paused" || props.status === "starting";
  const lineLabel = props.playingPosition >= 0 ? `Line ${props.playingPosition + 1} of ${props.lineCount}` : `${props.lineCount} lines`;

  return (
    <div className={styles.controls}>
      <Button look="primary" onClick={mainAction.onClick} isDisabled={!mainAction.onClick}>
        {mainAction.label}
      </Button>
      {isActive && (
        <Button look="plain" onClick={props.onStop}>
          Stop
        </Button>
      )}
      <span className={styles.position}>{lineLabel}</span>
    </div>
  );
}
