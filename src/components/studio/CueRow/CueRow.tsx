import type { CueRowProps } from "./CueRowProps";
import styles from "./CueRow.module.css";

export function CueRow(props: CueRowProps) {
  const className = [styles.row, props.startsParagraph ? styles.paragraph : ""].join(" ");
  return (
    <li className={className} data-playing={props.isPlaying} data-colour={props.colourNumber}>
      <button type="button" className={styles.play} aria-label={`Play ${props.speaker}'s line`} onClick={props.onPlay}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5.2v13.6a1 1 0 0 0 1.5.86l11-6.8a1 1 0 0 0 0-1.72l-11-6.8A1 1 0 0 0 8 5.2z" />
        </svg>
      </button>
      <span className={styles.speaker}>
        {props.speaker}
        <span className={styles.voice}>{props.voice}</span>
      </span>
      <p className={styles.text}>{props.text}</p>
    </li>
  );
}
