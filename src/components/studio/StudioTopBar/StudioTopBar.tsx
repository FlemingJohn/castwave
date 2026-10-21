import { StoriesMenu } from "@/components/studio/StoriesMenu/StoriesMenu";
import { CharacterAvatar } from "@/components/ui/CharacterAvatar/CharacterAvatar";
import { Icon } from "@/components/ui/Icon/Icon";
import type { StudioTopBarProps } from "./StudioTopBarProps";
import styles from "./StudioTopBar.module.css";

export function StudioTopBar(props: StudioTopBarProps) {
  const { script } = props;
  return (
    <div className={styles.bar}>
      <StoriesMenu currentTitle={script.title} currentSlug={script.showcase} onPick={props.onPickShowcase} />
      <h2 id="script-title" className={styles.title}>
        {script.title}
      </h2>
      <span className={styles.meta}>
        {script.format}
        {script.ambience ? ` · ${script.ambience}` : ""}
      </span>
      {script.showcase && <span className={styles.showcase}>Showcase · voiced earlier by AssemblyAI</span>}
      <span className={styles.spacer} />
      <button type="button" className={styles.toggle} aria-pressed={props.isCastOpen} onClick={props.onToggleCast}>
        <Icon name="cast" />
        Cast
        <span className={styles.avatars} aria-hidden="true">
          {script.cast.slice(0, 4).map((character, position) => (
            <CharacterAvatar
              key={character.name}
              kind={character.name === "Narrator" ? "narrator" : "character"}
              initial={character.name.slice(0, 1)}
              colourNumber={(position % 6) + 1}
              size={22}
            />
          ))}
        </span>
      </button>
      <button type="button" className={styles.toggle} aria-pressed={props.isBeside} onClick={props.onToggleBeside}>
        <Icon name="columns" />
        Script beside
      </button>
    </div>
  );
}
