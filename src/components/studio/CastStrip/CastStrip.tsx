import { CharacterAvatar } from "@/components/ui/CharacterAvatar/CharacterAvatar";
import { describeVoice } from "@/services/speech/describeVoice";
import { VoiceName } from "@/types/VoiceName";
import type { CastStripProps } from "./CastStripProps";
import styles from "./CastStrip.module.css";

export function CastStrip(props: CastStripProps) {
  return (
    <ul className={styles.strip} aria-label="Cast">
      {props.cast.map((character, position) => (
        <li key={character.name} className={styles.member}>
          <CharacterAvatar
            kind={character.name === "Narrator" ? "narrator" : "character"}
            initial={character.name.slice(0, 1)}
            colourNumber={(position % 6) + 1}
            size={28}
          />
          <span className={styles.name}>{character.name}</span>
          <select
            className={styles.voice}
            aria-label={`Voice for ${character.name}`}
            value={character.voice}
            onChange={(event) => props.onVoiceChange(character.name, VoiceName.parse(event.target.value))}
          >
            {VoiceName.options.map((voice) => (
              <option key={voice} value={voice}>
                {describeVoice(voice).label}
              </option>
            ))}
          </select>
        </li>
      ))}
    </ul>
  );
}
