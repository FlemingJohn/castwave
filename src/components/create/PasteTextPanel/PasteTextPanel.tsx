import { useState } from "react";
import { Chip } from "@/components/ui/Chip/Chip";
import { TextArea } from "@/components/ui/TextArea/TextArea";
import { MAX_TEXT_CHARACTERS } from "@/types/sourceLimits";
import { SAMPLE_STORIES } from "./sampleStories";
import styles from "./PasteTextPanel.module.css";

export function PasteTextPanel() {
  const firstStory = SAMPLE_STORIES[0];
  const [text, setText] = useState(firstStory ? firstStory.text : "");

  return (
    <div className={styles.panel}>
      <div className={styles.samples}>
        <span className={styles.samplesLabel}>Try</span>
        {SAMPLE_STORIES.map((story) => (
          <Chip
            key={story.name}
            label={story.name}
            isPressed={story.text === text}
            onPress={() => setText(story.text)}
          />
        ))}
      </div>
      <TextArea
        id="story-text"
        name="text"
        label="Story or article text"
        rows={9}
        maxLength={MAX_TEXT_CHARACTERS}
        value={text}
        onChange={setText}
      />
      <p className={styles.counter} data-full={text.length >= MAX_TEXT_CHARACTERS} aria-live="polite">
        {text.length.toLocaleString("en")} / {MAX_TEXT_CHARACTERS.toLocaleString("en")} characters
        {text.length >= MAX_TEXT_CHARACTERS ? " · limit reached" : ""}
      </p>
    </div>
  );
}
