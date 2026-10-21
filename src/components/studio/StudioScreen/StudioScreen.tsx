import { ScriptPreview } from "@/components/studio/ScriptPreview/ScriptPreview";
import styles from "./StudioScreen.module.css";

export function StudioScreen() {
  return (
    <main className={styles.screen}>
      <div className={styles.column}>
        <h1 className={styles.title}>Studio</h1>
        <ScriptPreview />
      </div>
    </main>
  );
}
