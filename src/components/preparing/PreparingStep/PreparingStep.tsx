import { Icon } from "@/components/ui/Icon/Icon";
import type { PreparingStepProps } from "./PreparingStepProps";
import styles from "./PreparingStep.module.css";

export function PreparingStep(props: PreparingStepProps) {
  return (
    <li className={styles.step} data-state={props.state}>
      <span className={styles.badge}>
        <svg className={styles.ring} viewBox="0 0 38 38" aria-hidden="true">
          <circle cx="19" cy="19" r="17.5" />
        </svg>
        <Icon name={props.icon} />
        <span className={styles.tick}>
          <Icon name="check" />
        </span>
      </span>
      <b className={styles.title}>{props.title}</b>
      <span className={styles.detail}>{props.detail}</span>
      {props.children}
    </li>
  );
}
