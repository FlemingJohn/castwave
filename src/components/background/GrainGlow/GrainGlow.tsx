import styles from "./GrainGlow.module.css";

export function GrainGlow() {
  return (
    <>
      <div className={styles.glow} aria-hidden="true" />
      <div className={styles.grain} aria-hidden="true" />
    </>
  );
}
