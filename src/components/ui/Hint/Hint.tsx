import { Icon } from "@/components/ui/Icon/Icon";
import type { HintProps } from "./HintProps";
import styles from "./Hint.module.css";

export function Hint(props: HintProps) {
  return (
    <p className={styles.hint}>
      <Icon name="information" />
      <span>{props.children}</span>
    </p>
  );
}
