import styles from "./FullCast.module.css";

export function FullCast() {
  return (
    <svg className={styles.art} viewBox="0 0 320 220" role="img" aria-label="Two speech bubbles with waveforms, and a plus sign for adding more voices">
      <circle cx="112" cy="84" r="64" className={styles.bloomGlow} />
      <circle cx="198" cy="132" r="72" className={styles.irisGlow} />
      <g className={styles.lines}>
        <path d="M70 58h70a14 14 0 0 1 14 14v26a14 14 0 0 1-14 14H96l-14 14v-14H70a14 14 0 0 1-14-14V72a14 14 0 0 1 14-14z" className={styles.filled} />
        <path d="M78 85v6M86 80v16M94 83v10M102 77v22M110 82v12M118 85v6M126 81v14M134 85v6" />
        <path d="M170 98h76a14 14 0 0 1 14 14v26a14 14 0 0 1-14 14h-12v14l-14-14h-50a14 14 0 0 1-14-14v-26a14 14 0 0 1 14-14z" className={styles.filled} />
        <path d="M180 125v6M188 120v16M196 123v10M204 117v22M212 122v12M220 125v6M228 121v14M236 125v6M244 123v10" className={styles.haze} />
        <circle cx="250" cy="64" r="13" className={styles.bloom} />
        <path d="M244 64h12M250 58v12" className={styles.bloom} />
      </g>
    </svg>
  );
}
