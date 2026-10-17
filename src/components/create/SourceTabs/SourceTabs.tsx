import { Icon } from "@/components/ui/Icon/Icon";
import type { SourceTabsProps } from "./SourceTabsProps";
import styles from "./SourceTabs.module.css";

export function SourceTabs(props: SourceTabsProps) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Source">
      {TABS.map((tab) => (
        <button
          key={tab.kind}
          type="button"
          role="tab"
          className={styles.tab}
          aria-selected={props.source === tab.kind}
          onClick={() => props.onPick(tab.kind)}
        >
          <Icon name={tab.icon} />
          {tab.label}
        </button>
      ))}
    </div>
  );
}

const TABS = [
  { kind: "text", label: "Paste text", icon: "document" },
  { kind: "link", label: "Website link", icon: "link" },
  { kind: "idea", label: "From an idea", icon: "bulb" },
] as const;
