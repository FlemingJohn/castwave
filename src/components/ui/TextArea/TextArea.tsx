import type { TextAreaProps } from "./TextAreaProps";
import styles from "./TextArea.module.css";

export function TextArea(props: TextAreaProps) {
  return (
    <textarea
      id={props.id}
      name={props.name}
      aria-label={props.label}
      className={styles.textArea}
      rows={props.rows}
      maxLength={props.maxLength}
      value={props.value}
      spellCheck={false}
      onChange={(event) => props.onChange(event.target.value)}
    />
  );
}
