import type { CastStripProps } from "./CastStripProps";
import styles from "./CastStrip.module.css";

export function CastStrip(props: CastStripProps) {
  return (
    <ul className={styles.strip} aria-label="Cast">
      {props.cast.map((character, position) => (
        <li key={character.name} className={styles.member}>
          <span className={styles.badge} style={{ background: `var(--colour-character-${(position % 6) + 1})` }}>
            {character.name.slice(0, 1)}
          </span>
          <span className={styles.name}>{character.name}</span>
          <span className={styles.voice}>{character.voice}</span>
        </li>
      ))}
    </ul>
  );
}
