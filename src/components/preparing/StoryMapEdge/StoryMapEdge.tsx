import { STORY_NODE_HEIGHT, STORY_NODE_WIDTH } from "@/components/preparing/StoryMap/storyNodeSize";
import type { StoryMapEdgeProps } from "./StoryMapEdgeProps";
import styles from "./StoryMapEdge.module.css";

const CURVE = 70;

export function StoryMapEdge(props: StoryMapEdgeProps) {
  const { from, to, choiceNumber } = props.edge;
  const x1 = from.x + STORY_NODE_WIDTH;
  const y1 = from.y + STORY_NODE_HEIGHT / 2;
  const x2 = to.x;
  const y2 = to.y + STORY_NODE_HEIGHT / 2;
  return (
    <g className={styles.edge} data-taken={props.isTaken}>
      <path className={styles.line} d={`M${x1} ${y1} C${x1 + CURVE} ${y1}, ${x2 - CURVE} ${y2}, ${x2} ${y2}`} />
      <g transform={`translate(${(x1 + x2) / 2} ${(y1 + y2) / 2})`}>
        <rect className={styles.tag} x="-13" y="-10" width="26" height="20" rx="10" />
        <text className={styles.label} textAnchor="middle" y="3.5">
          {props.isTaken ? choiceNumber + 1 : "?"}
        </text>
      </g>
    </g>
  );
}
