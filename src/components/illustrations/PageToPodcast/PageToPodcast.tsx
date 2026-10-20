import styles from "./PageToPodcast.module.css";

export function PageToPodcast() {
  return (
    <svg className={styles.art} viewBox="0 0 320 200" role="img" aria-label="A web page with lines of text turning into two speech bubbles">
      <circle cx="96" cy="100" r="58" className={styles.irisGlow} />
      <circle cx="228" cy="92" r="56" className={styles.bloomGlow} />
      <g className={styles.lines}>
        <rect x="56" y="42" width="86" height="112" rx="10" className={styles.filled} />
        <path d="M56 62h86" />
        <circle cx="66" cy="52" r="1.5" className={styles.dot} />
        <circle cx="73" cy="52" r="1.5" className={styles.dot} />
        <path d="M70 80h56M70 94h48M70 108h58M70 122h40M70 136h50" className={styles.quiet} />
        <path d="M154 98h22m0 0-8-8m8 8-8 8" className={styles.haze} />
        <path d="M196 58h60a12 12 0 0 1 12 12v18a12 12 0 0 1-12 12h-40l-12 12v-12h-8a12 12 0 0 1-12-12V70a12 12 0 0 1 12-12z" className={styles.filled} />
        <path d="M208 114h44a12 12 0 0 1 12 12v12a12 12 0 0 1-12 12h-4v12l-12-12h-28a12 12 0 0 1-12-12v-12a12 12 0 0 1 12-12z" className={styles.filledBloom} />
      </g>
    </svg>
  );
}
