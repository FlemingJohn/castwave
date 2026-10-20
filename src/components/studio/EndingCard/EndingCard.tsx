import { Button } from "@/components/ui/Button/Button";
import type { EndingCardProps } from "./EndingCardProps";
import styles from "./EndingCard.module.css";

export function EndingCard(props: EndingCardProps) {
  return (
    <section className={styles.card} aria-label="The end">
      <span className={styles.label}>You reached an ending</span>
      <h3 className={styles.title}>{props.endingTitle}</h3>
      <p className={styles.note}>This story has {props.endingCount} endings. Choose differently to find the others.</p>
      <Button look="primary" onClick={props.onRestart}>
        Start again
      </Button>
    </section>
  );
}
