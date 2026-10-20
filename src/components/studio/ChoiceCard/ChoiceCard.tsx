import { useEffect } from "react";
import { Icon } from "@/components/ui/Icon/Icon";
import { useSpokenChoice } from "@/hooks/useSpokenChoice";
import type { ChoiceCardProps } from "./ChoiceCardProps";
import styles from "./ChoiceCard.module.css";

export function ChoiceCard(props: ChoiceCardProps) {
  const { choices, onChoose } = props;
  const listening = useSpokenChoice(
    choices.map((choice) => choice.label),
    (position) => {
      const choice = choices[position];
      if (choice) {
        onChoose(choice);
      }
    },
  );
  const isListening = listening.status === "listening" || listening.status === "starting";

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

  useEffect(() => {
    const timer = setTimeout(() => {
      if (props.isVoiceMode) {
        void listening.start();
      }
    });
    return () => clearTimeout(timer);
  }, []);

  function toggleListening() {
    props.onVoiceModeChange(!isListening);
    if (isListening) {
      listening.stop();
    } else {
      void listening.start();
    }
  }

  return (
    <section className={styles.card} aria-label="Your choice">
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
      <div className={styles.voice} data-listening={isListening}>
        <button type="button" className={styles.microphone} aria-pressed={isListening} onClick={toggleListening}>
          <Icon name="microphone" />
          {isListening ? "Stop listening" : "Say your choice"}
        </button>
        <p className={styles.heard} aria-live="polite">
          {describeListening(listening.status, listening.transcript, listening.errorMessage)}
        </p>
      </div>
    </section>
  );
}

function describeListening(status: string, transcript: string, errorMessage: string) {
  if (status === "failed") {
    return `The microphone stopped: ${errorMessage}`;
  }
  if (status === "starting") {
    return "Starting the microphone…";
  }
  if (status === "listening") {
    return transcript ? `“${transcript}”` : "Listening. Say a few words from a choice, or “first” or “second”.";
  }
  return "Speak your choice out loud. AssemblyAI streaming speech-to-text listens for it.";
}
