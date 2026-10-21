import type { EndingOverlayProps } from "./EndingOverlayProps";
import styles from "./EndingOverlay.module.css";

export function EndingOverlay(props: EndingOverlayProps) {
  return (
    <section className={styles.ending} aria-label="The end">
      <span className={styles.label}>
        The end · {props.foundCount} of {props.endingCount} endings found
      </span>
      <h3 className={styles.title}>{props.endingTitle}</h3>
      <div className={styles.actions}>
        <button type="button" className={styles.primary} onClick={props.onRestart}>
          Start again
        </button>
        <button type="button" className={styles.secondary} onClick={props.onShowPath}>
          See your path
        </button>
      </div>
    </section>
  );
}
