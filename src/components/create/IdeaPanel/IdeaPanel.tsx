import { useState } from "react";
import { TextArea } from "@/components/ui/TextArea/TextArea";
import styles from "./IdeaPanel.module.css";

export function IdeaPanel() {
  const [idea, setIdea] = useState(FIRST_IDEA);

  return (
    <div className={styles.panel}>
      <TextArea id="story-idea" name="idea" label="Your idea" rows={4} value={idea} onChange={setIdea} />
    </div>
  );
}

const FIRST_IDEA =
  "A rainy night in Victorian London. A French woman asks Sherlock Holmes to find her brother, who vanished from the Calais train.";
