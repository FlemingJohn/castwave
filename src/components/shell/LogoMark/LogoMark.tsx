import type { LogoMarkProps } from "./LogoMarkProps";
import styles from "./LogoMark.module.css";

export function LogoMark(props: LogoMarkProps) {
  return (
    <svg className={styles.mark} width={props.size} height={props.size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <radialGradient id="castwave-logo-tile" cx="0.2" cy="0.15" r="1.05">
          <stop offset="0" className={styles.bloom} />
          <stop offset="0.38" className={styles.haze} />
          <stop offset="0.7" className={styles.iris} />
          <stop offset="1" className={styles.deep} />
        </radialGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#castwave-logo-tile)" />
      <g className={styles.waves}>
        <path d="M24.24 15.76A6 6 0 1 0 24.24 24.24" />
        <path d="M27.07 12.93A10 10 0 1 0 27.07 27.07" opacity="0.7" />
        <path d="M29.9 10.1A14 14 0 1 0 29.9 29.9" opacity="0.42" />
      </g>
      <circle cx="20" cy="20" r="2" className={styles.voice} />
    </svg>
  );
}
