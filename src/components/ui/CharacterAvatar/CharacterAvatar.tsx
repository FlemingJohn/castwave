import { useId } from "react";
import type { CharacterAvatarProps } from "./CharacterAvatarProps";
import styles from "./CharacterAvatar.module.css";

export function CharacterAvatar(props: CharacterAvatarProps) {
  const glowId = `avatar-glow-${useId()}`;
  return (
    <svg
      className={styles.avatar}
      data-colour={props.kind === "sound" ? 0 : props.colourNumber}
      data-live={props.isLive ?? false}
      width={props.size}
      height={props.size}
      viewBox="0 0 44 44"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={glowId} cx="0.38" cy="0.32" r="0.75">
          <stop offset="0" className={styles.glowStart} />
          <stop offset="1" className={styles.glowEnd} />
        </radialGradient>
      </defs>
      <circle cx="22" cy="22" r="21.5" className={styles.base} />
      <circle cx="22" cy="22" r="21.5" fill={`url(#${glowId})`} />
      <circle cx="22" cy="22" r="20.4" className={props.kind === "sound" ? styles.dashedRing : styles.ring} />
      {INSIDE_BY_KIND[props.kind] ?? null}
      {props.kind === "character" && (
        <text x="22" y="27.6" textAnchor="middle" className={styles.initial}>
          {props.initial}
        </text>
      )}
    </svg>
  );
}

const INSIDE_BY_KIND = {
  narrator: (
    <g className={styles.lines} transform="translate(6.6 6.6) scale(0.77)">
      <path d="M24.24 15.76A6 6 0 1 0 24.24 24.24" />
      <path d="M27.07 12.93A10 10 0 1 0 27.07 27.07" opacity="0.7" />
      <path d="M29.9 10.1A14 14 0 1 0 29.9 29.9" opacity="0.42" />
      <circle cx="20" cy="20" r="2" className={styles.dot} />
    </g>
  ),
  sound: (
    <g className={styles.lines}>
      <path d="M14 19.5v5h3.5l4.5 3.5v-12l-4.5 3.5z" />
      <path d="M25.5 19a4 4 0 0 1 0 6M28 16.5a7.5 7.5 0 0 1 0 11" />
    </g>
  ),
  character: undefined,
};
