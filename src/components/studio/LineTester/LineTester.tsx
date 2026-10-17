"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { ErrorNote } from "@/components/ui/ErrorNote/ErrorNote";
import { TextArea } from "@/components/ui/TextArea/TextArea";
import { VoiceName } from "@/types/VoiceName";
import { useSpokenLine } from "@/hooks/useSpokenLine";
import styles from "./LineTester.module.css";

export function LineTester() {
  const [text, setText] = useState(FIRST_LINE);
  const [voice, setVoice] = useState<VoiceName>("charles");
  const spokenLine = useSpokenLine();
  const isBusy = spokenLine.status === "connecting" || spokenLine.status === "speaking";

  return (
    <section className={styles.card} aria-labelledby="line-tester-title">
      <h2 id="line-tester-title" className={styles.title}>
        Try one line
      </h2>
      <div className={styles.controls}>
        <label className={styles.voiceField}>
          <span className={styles.label}>Voice</span>
          <select
            className={styles.select}
            value={voice}
            onChange={(event) => setVoice(VoiceName.parse(event.target.value))}
          >
            {VoiceName.options.map((name) => (
              <option key={name} value={name}>
                {name} · {ACCENT_BY_VOICE[name]}
              </option>
            ))}
          </select>
        </label>
        <Button look="primary" isDisabled={isBusy} onClick={() => void spokenLine.speak(text, voice)}>
          {LABEL_BY_STATUS[spokenLine.status]}
        </Button>
      </div>
      <TextArea id="test-line" name="line" label="Line to speak" rows={3} value={text} onChange={setText} />
      <ol className={styles.steps} aria-label="Timings">
        {spokenLine.steps.map((step) => (
          <li key={step.label} className={styles.step}>
            <span>{step.label}</span>
            <b>{step.milliseconds} ms</b>
          </li>
        ))}
      </ol>
      {spokenLine.words.length > 0 && <p className={styles.words}>{spokenLine.words.join(" ")}</p>}
      {spokenLine.errorMessage && <ErrorNote message={spokenLine.errorMessage} />}
    </section>
  );
}

const FIRST_LINE = "Watson, we have a visitor. A lady, by the sound of her step, and in some haste.";

const LABEL_BY_STATUS = {
  idle: "Speak",
  connecting: "Connecting…",
  speaking: "Speaking…",
  done: "Speak again",
  failed: "Try again",
};

const ACCENT_BY_VOICE: Record<VoiceName, string> = {
  alba: "English",
  anna: "English",
  charles: "English",
  eve: "English",
  george: "English",
  iris: "English",
  jane: "English",
  jean: "English",
  mary: "English",
  michael: "English",
  paul: "English",
  reid: "English",
  vera: "English",
  estelle: "French",
  giovanni: "Italian",
  juergen: "German",
  lola: "Spanish",
  rafael: "Portuguese",
};
