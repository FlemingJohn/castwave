import { useState } from "react";
import { Chip } from "@/components/ui/Chip/Chip";
import { TextArea } from "@/components/ui/TextArea/TextArea";
import styles from "./IdeaPanel.module.css";

export function IdeaPanel() {
  const [idea, setIdea] = useState(FIRST_IDEA);
  const [minutes, setMinutes] = useState(3);

  return (
    <div className={styles.panel}>
      <TextArea id="story-idea" name="idea" label="Your idea" rows={4} value={idea} onChange={setIdea} />
      <div className={styles.lengths}>
        <span className={styles.lengthsLabel}>Length</span>
        {LENGTHS_IN_MINUTES.map((length) => (
          <Chip
            key={length}
            label={`${length} min`}
            isPressed={length === minutes}
            onPress={() => setMinutes(length)}
          />
        ))}
        <input type="hidden" name="minutes" value={minutes} />
      </div>
    </div>
  );
}

const FIRST_IDEA =
  "A rainy night in Victorian London. A French woman asks Sherlock Holmes to find her brother, who vanished from the Calais train.";

const LENGTHS_IN_MINUTES = [1, 3, 10];
