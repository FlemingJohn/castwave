import styles from "./WaitingForScript.module.css";

export function WaitingForScript() {
  return (
    <svg className={styles.art} viewBox="0 0 320 200" role="img" aria-label="A microphone with sound waves spreading out on both sides">
      <circle cx="160" cy="96" r="70" className={styles.irisGlow} />
      <circle cx="122" cy="62" r="38" className={styles.bloomGlow} />
      <g className={styles.lines}>
        <rect x="143" y="48" width="34" height="68" rx="17" className={styles.filled} />
        <path d="M128 98a32 32 0 0 0 64 0M160 130v22M144 152h32" />
        <path d="M108 78a62 62 0 0 0 0 44M212 78a62 62 0 0 1 0 44" opacity="0.8" />
        <path d="M88 66a88 88 0 0 0 0 68M232 66a88 88 0 0 1 0 68" opacity="0.5" />
        <path d="M68 56a112 112 0 0 0 0 88M252 56a112 112 0 0 1 0 88" opacity="0.25" />
      </g>
    </svg>
  );
}
