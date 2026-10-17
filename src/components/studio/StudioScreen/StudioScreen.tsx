import { LineTester } from "@/components/studio/LineTester/LineTester";
import styles from "./StudioScreen.module.css";

export function StudioScreen() {
  return (
    <main className={styles.screen}>
      <div className={styles.column}>
        <div>
          <h1 className={styles.title}>Studio</h1>
          <p className={styles.lede}>
            Pick a voice and hear a line spoken by AssemblyAI. Each line gets its own voice session, and the timings show
            how long each step took.
          </p>
        </div>
        <LineTester />
      </div>
    </main>
  );
}
