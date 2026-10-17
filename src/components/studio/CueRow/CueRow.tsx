import type { CueRowProps } from "./CueRowProps";
import styles from "./CueRow.module.css";

export function CueRow(props: CueRowProps) {
  const className = [styles.row, props.startsParagraph ? styles.paragraph : ""].join(" ");
  const words = props.text.split(/\s+/);
  const isPlaying = props.status === "playing";
  return (
    <li className={className} data-status={props.status} data-colour={props.colourNumber}>
      <button type="button" className={styles.play} aria-label={`Play from ${props.speaker}'s line`} onClick={props.onPlay}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z" />
        </svg>
      </button>
      <span className={styles.speaker}>
        {props.speaker}
        <span className={styles.voice}>{props.voice}</span>
        <span className={styles.status}>{LABEL_BY_STATUS[props.status]}</span>
      </span>
      <p className={styles.text}>
        {words.map((word, position) => (
          <span key={position} className={isPlaying && position < props.spokenWordCount ? styles.spoken : undefined}>
            {word}{" "}
          </span>
        ))}
      </p>
    </li>
  );
}

const LABEL_BY_STATUS = {
  waiting: "",
  rendering: "Rendering",
  ready: "Ready",
  playing: "On air",
  played: "",
};
