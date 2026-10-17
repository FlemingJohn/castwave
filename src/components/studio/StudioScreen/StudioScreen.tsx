import { LineTester } from "@/components/studio/LineTester/LineTester";
import { ScriptPreview } from "@/components/studio/ScriptPreview/ScriptPreview";
import styles from "./StudioScreen.module.css";

export function StudioScreen() {
  return (
    <main className={styles.screen}>
      <div className={styles.column}>
        <div>
          <h1 className={styles.title}>Studio</h1>
          <p className={styles.lede}>
            Your script, with a voice for every character. Press play on any line to hear it from AssemblyAI streaming
            text-to-speech.
          </p>
        </div>
        <ScriptPreview />
        <LineTester />
      </div>
    </main>
  );
}
