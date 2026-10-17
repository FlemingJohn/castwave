"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon/Icon";
import styles from "./ViewSwitch.module.css";

export function ViewSwitch() {
  const pathname = usePathname();
  return (
    <nav className={styles.switch} aria-label="Views">
      {VIEWS.map((view) => (
        <Link
          key={view.href}
          href={view.href}
          className={styles.view}
          aria-current={pathname === view.href ? "page" : undefined}
        >
          <Icon name={view.icon} />
          <span className={styles.label}>{view.label}</span>
        </Link>
      ))}
    </nav>
  );
}

const VIEWS = [
  { href: "/", label: "Create", icon: "plus" },
  { href: "/studio", label: "Studio", icon: "studio" },
] as const;
