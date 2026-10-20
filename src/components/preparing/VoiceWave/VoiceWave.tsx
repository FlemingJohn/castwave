import type { VoiceWaveProps } from "./VoiceWaveProps";
import styles from "./VoiceWave.module.css";

const BAR_COUNT = 40;
const BAR_WIDTH = 320 / BAR_COUNT;

export function VoiceWave(props: VoiceWaveProps) {
  return (
    <svg
      className={styles.wave}
      data-active={props.isActive}
      viewBox="0 0 320 54"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {Array.from({ length: BAR_COUNT }, (_, index) => (
        <rect
          key={index}
          className={styles.bar}
          x={index * BAR_WIDTH + 1.5}
          y="7"
          width={BAR_WIDTH - 3}
          height="40"
          rx="2"
          style={{
            animationDelay: `${-((index * 37) % 90) / 100}s`,
            animationDuration: `${0.7 + ((index * 13) % 7) / 10}s`,
          }}
        />
      ))}
    </svg>
  );
}
