import { CharacterAvatar } from "@/components/ui/CharacterAvatar/CharacterAvatar";
import type { CastRingsProps } from "./CastRingsProps";
import styles from "./CastRings.module.css";

const RING_LENGTH = 182.2;

export function CastRings(props: CastRingsProps) {
  return (
    <ul className={styles.cast} aria-label="Lines voiced for each character">
      {props.cast.map((character, position) => {
        const counts = props.progress?.characters.find((member) => member.name === character.name);
        const share = counts && counts.total > 0 ? counts.done / counts.total : 0;
        return (
          <li key={character.name} className={styles.member}>
            <span className={styles.portrait}>
              <svg className={styles.ring} data-colour={(position % 6) + 1} viewBox="0 0 64 64" aria-hidden="true">
                <circle className={styles.track} cx="32" cy="32" r="29" />
                <circle
                  className={styles.fill}
                  cx="32"
                  cy="32"
                  r="29"
                  strokeDasharray={RING_LENGTH}
                  strokeDashoffset={RING_LENGTH * (1 - share)}
                />
              </svg>
              <span className={styles.avatar}>
                <CharacterAvatar
                  kind={character.name === "Narrator" ? "narrator" : "character"}
                  initial={character.name.slice(0, 1)}
                  colourNumber={(position % 6) + 1}
                  size={46}
                />
              </span>
            </span>
            <b className={styles.name}>{character.name}</b>
            <small className={styles.count}>{counts ? `${counts.done} of ${counts.total} lines` : "no lines"}</small>
          </li>
        );
      })}
    </ul>
  );
}
