import Link from "next/link";
import { ViewSwitch } from "@/components/shell/ViewSwitch/ViewSwitch";
import styles from "./AppHeader.module.css";

export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link href="/" className={styles.brand}>
          <svg className={styles.logo} viewBox="0 0 40 40" aria-hidden="true">
            <rect className={styles.logoTile} width="40" height="40" rx="12" />
            <path className={styles.logoBars} d="M11 17v6M16 13v14M21 10v20M26 14v12M31 18v4" />
            <circle className={styles.logoDot} cx="21" cy="10" r="3" />
          </svg>
          <span>Castwave</span>
        </Link>
        <ViewSwitch />
      </div>
    </header>
  );
}
