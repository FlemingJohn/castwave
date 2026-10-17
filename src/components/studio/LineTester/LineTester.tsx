"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { TextArea } from "@/components/ui/TextArea/TextArea";
import { VoiceName } from "@/types/VoiceName";
import { useSpokenLine } from "./useSpokenLine";
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
      {spokenLine.errorMessage && <p className={styles.error}>{spokenLine.errorMessage}</p>}
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
  alba: "US",
  eve: "US",
  george: "US",
  jane: "US",
  jean: "US",
  mary: "US",
  michael: "US",
  anna: "UK",
  charles: "UK",
  paul: "UK",
  vera: "UK",
  giovanni: "Italian",
  lola: "Spanish",
  juergen: "German",
  rafael: "Portuguese",
  estelle: "French",
};
