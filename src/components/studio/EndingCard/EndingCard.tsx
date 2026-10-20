import { StoryMap } from "@/components/preparing/StoryMap/StoryMap";
import { Button } from "@/components/ui/Button/Button";
import type { EndingCardProps } from "./EndingCardProps";
import styles from "./EndingCard.module.css";

export function EndingCard(props: EndingCardProps) {
  const endingCount = props.script.scenes.filter((scene) => scene.ending).length;
  const foundCount = props.foundEndingIds.length;
  return (
    <section className={styles.card} aria-label="The end">
      <span className={styles.label}>You reached an ending</span>
      <h3 className={styles.title}>{props.endingTitle}</h3>
      <p className={styles.note}>
        You have found {foundCount} of {endingCount} endings.
        {foundCount < endingCount
          ? " The map shows your path. Choose differently to unlock the others."
          : " You found them all."}
      </p>
      <div className={styles.map}>
        <StoryMap
          scenes={props.script.scenes}
          firstSceneId={props.script.firstSceneId}
          progress={null}
          visitedSceneIds={props.visitedSceneIds}
          foundEndingIds={props.foundEndingIds}
          getPicture={props.getPicture}
        />
      </div>
      <Button look="primary" onClick={props.onRestart}>
        Start again
      </Button>
    </section>
  );
}
