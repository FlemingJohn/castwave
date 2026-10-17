import { Hint } from "@/components/ui/Hint/Hint";
import { Icon } from "@/components/ui/Icon/Icon";
import styles from "./WebsiteLinkPanel.module.css";

export function WebsiteLinkPanel() {
  return (
    <div className={styles.panel}>
      <label className={styles.field}>
        <Icon name="globe" />
        <input
          className={styles.input}
          type="url"
          name="url"
          inputMode="url"
          placeholder="https://"
          aria-label="Web page address"
        />
      </label>
      <Hint>
        Castwave downloads the page, keeps only the article text without menus or ads, and turns it into a script.
        Pages behind a login or paywall can't be read.
      </Hint>
    </div>
  );
}
