import { useEffect } from "react";
import type { ChoiceCardProps } from "./ChoiceCardProps";
import styles from "./ChoiceCard.module.css";

export function ChoiceCard(props: ChoiceCardProps) {
  const { choices, onChoose } = props;

  useEffect(() => {
    function chooseByKey(event: KeyboardEvent) {
      const choice = choices[Number(event.key) - 1];
      if (choice && !(event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement)) {
        onChoose(choice);
      }
    }
    window.addEventListener("keydown", chooseByKey);
    return () => window.removeEventListener("keydown", chooseByKey);
  }, [choices, onChoose]);

  return (
    <section className={styles.move} aria-label="Your choice">
      <span className={styles.label}>Your move</span>
      <h3 className={styles.question}>{props.question}</h3>
      <div className={styles.options}>
        {choices.map((choice, position) => (
          <button key={choice.nextSceneId} type="button" className={styles.option} onClick={() => onChoose(choice)}>
            <kbd className={styles.key}>{position + 1}</kbd>
            {choice.label}
          </button>
        ))}
      </div>
    </section>
  );
}
