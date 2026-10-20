import { LANGUAGE_BY_VOICE } from "@/services/speech/languageByVoice";
import { VoiceName } from "@/types/VoiceName";
import type { CastStripProps } from "./CastStripProps";
import styles from "./CastStrip.module.css";

export function CastStrip(props: CastStripProps) {
  return (
    <ul className={styles.strip} aria-label="Cast">
      {props.cast.map((character, position) => (
        <li key={character.name} className={styles.member} data-colour={(position % 6) + 1}>
          <span className={styles.badge}>{character.name.slice(0, 1)}</span>
          <span className={styles.name}>{character.name}</span>
          <select
            className={styles.voice}
            aria-label={`Voice for ${character.name}`}
            value={character.voice}
            onChange={(event) => props.onVoiceChange(character.name, VoiceName.parse(event.target.value))}
          >
            {VoiceName.options.map((voice) => (
              <option key={voice} value={voice}>
                {voice} · {LANGUAGE_BY_VOICE[voice]}
              </option>
            ))}
          </select>
        </li>
      ))}
    </ul>
  );
}
