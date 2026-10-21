import type { SceneProgressProps } from "./SceneProgressProps";
import styles from "./SceneProgress.module.css";

export function SceneProgress(props: SceneProgressProps) {
  return (
    <span className={styles.progress} aria-label={`Scene ${props.current} of ${props.total}`}>
      <span className={styles.label}>
        Scene {props.current} of {props.total}
      </span>
      {Array.from({ length: props.total }, (_, index) => (
        <i key={index} data-state={index + 1 < props.current ? "done" : index + 1 === props.current ? "now" : "next"} />
      ))}
    </span>
  );
}
