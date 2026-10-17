import type { ErrorNoteProps } from "./ErrorNoteProps";
import styles from "./ErrorNote.module.css";

export function ErrorNote(props: ErrorNoteProps) {
  return (
    <p className={styles.note} role="alert">
      {props.message}
    </p>
  );
}
