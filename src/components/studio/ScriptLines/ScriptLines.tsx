import { Fragment } from "react";
import { CueRow } from "@/components/studio/CueRow/CueRow";
import type { ScriptLinesProps } from "./ScriptLinesProps";
import styles from "./ScriptLines.module.css";

export function ScriptLines(props: ScriptLinesProps) {
  const { rows, snapshot } = props;
  return (
    <ol className={styles.lines}>
      {rows.map((row, position) => (
        <Fragment key={position}>
          {row.heading && <li className={styles.heading}>{row.heading}</li>}
          <CueRow
            speaker={row.label}
            voice={row.detail}
            text={row.text}
            isSound={row.performanceLine.kind === "sound"}
            colourNumber={row.colourNumber}
            startsParagraph={row.performanceLine.startsParagraph && position > 0 && !row.heading}
            status={snapshot.statuses[position] ?? "ready"}
            spokenWordCount={position === snapshot.playingPosition ? snapshot.spokenWordCount : 0}
            onPlay={() => props.onPlay(position)}
          />
        </Fragment>
      ))}
    </ol>
  );
}
