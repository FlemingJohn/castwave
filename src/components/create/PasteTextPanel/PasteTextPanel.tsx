import { useState } from "react";
import { Chip } from "@/components/ui/Chip/Chip";
import { TextArea } from "@/components/ui/TextArea/TextArea";
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
      <TextArea id="story-text" name="text" label="Story or article text" rows={9} value={text} onChange={setText} />
    </div>
  );
}
