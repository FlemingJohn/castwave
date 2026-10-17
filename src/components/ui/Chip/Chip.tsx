import type { ChipProps } from "./ChipProps";
import styles from "./Chip.module.css";

export function Chip(props: ChipProps) {
  return (
    <button type="button" className={styles.chip} aria-pressed={props.isPressed} onClick={props.onPress}>
      {props.label}
    </button>
  );
}
