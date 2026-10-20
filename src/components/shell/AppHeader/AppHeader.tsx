import Link from "next/link";
import { LogoMark } from "@/components/shell/LogoMark/LogoMark";
import { ViewSwitch } from "@/components/shell/ViewSwitch/ViewSwitch";
import styles from "./AppHeader.module.css";

export function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link href="/" className={styles.brand}>
          <LogoMark size={32} />
          <span>Castwave</span>
        </Link>
        <ViewSwitch />
      </div>
    </header>
  );
}
