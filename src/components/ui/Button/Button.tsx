import type { ButtonProps } from "./ButtonProps";
import styles from "./Button.module.css";

export function Button(props: ButtonProps) {
  const className = [styles.button, CLASS_BY_LOOK[props.look]].join(" ");
  return (
    <button type={props.type ?? "button"} className={className} onClick={props.onClick}>
      {props.children}
    </button>
  );
}

const CLASS_BY_LOOK = {
  primary: styles.primary,
  plain: styles.plain,
};
