import { CreateScriptForm } from "@/components/create/CreateScriptForm/CreateScriptForm";
import styles from "./CreateScreen.module.css";

export function CreateScreen() {
  return (
    <main className={styles.screen}>
      <div className={styles.column}>
        <div>
          <h1 className={styles.title}>What should the cast perform?</h1>
          <p className={styles.lede}>
            Bring a story, a web page or just an idea. Castwave writes the script, gives every character a voice and
            starts playing in about two seconds.
          </p>
        </div>
        <CreateScriptForm />
      </div>
    </main>
  );
}
