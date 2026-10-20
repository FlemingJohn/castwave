import { useId } from "react";
import { STORY_NODE_HEIGHT, STORY_NODE_WIDTH } from "@/components/preparing/StoryMap/storyNodeSize";
import type { StoryMapNodeProps } from "./StoryMapNodeProps";
import styles from "./StoryMapNode.module.css";

const LONGEST_TITLE = 22;

export function StoryMapNode(props: StoryMapNodeProps) {
  const clipId = `story-node-${useId()}`;
  const { scene, x, y, lockedTitle } = props.node;
  const isShown = props.isOpening || props.isVisited || props.isFound;
  const share = props.voicing && props.voicing.total > 0 ? props.voicing.done / props.voicing.total : 0;
  const isDone = props.voicing ? share === 1 : props.isVisited;
  return (
    <g
      className={styles.node}
      data-ending={Boolean(scene.ending)}
      data-done={isDone}
      transform={`translate(${x} ${y})`}
    >
      <clipPath id={clipId}>
        <rect width={STORY_NODE_WIDTH} height={STORY_NODE_HEIGHT} rx="11" />
      </clipPath>
      <rect className={styles.box} width={STORY_NODE_WIDTH} height={STORY_NODE_HEIGHT} rx="11" />
      {props.picture && (
        <image
          className={styles.picture}
          href={props.picture}
          width={STORY_NODE_WIDTH}
          height={STORY_NODE_HEIGHT}
          preserveAspectRatio="xMidYMid slice"
          clipPath={`url(#${clipId})`}
        />
      )}
      <rect
        className={styles.fill}
        width={STORY_NODE_WIDTH * share}
        height={STORY_NODE_HEIGHT}
        clipPath={`url(#${clipId})`}
      />
      <svg className={styles.icon} x="11" y="15" width="20" height="20" viewBox="0 0 24 24">
        {props.isOpening ? OPENING_ICON : scene.ending ? ENDING_ICON : CHOICE_ICON}
      </svg>
      <text className={styles.title} x="39" y="22">
        {shorten(isShown ? (scene.ending ?? scene.title) : lockedTitle)}
      </text>
      {!isShown && (
        <svg className={styles.lock} x={STORY_NODE_WIDTH - 26} y="17" width="16" height="16" viewBox="0 0 24 24">
          <rect x="5" y="11" width="14" height="9" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      )}
      <text className={styles.detail} x="39" y="37">
        {describe(props)}
      </text>
    </g>
  );
}

function describe(props: StoryMapNodeProps) {
  if (props.voicing) {
    return props.voicing.done === props.voicing.total
      ? "voiced"
      : `${props.voicing.done} of ${props.voicing.total} lines`;
  }
  if (props.isVisited) {
    return props.node.scene.ending ? "your ending" : "you were here";
  }
  return props.isFound ? "found earlier" : "still locked";
}

function shorten(title: string) {
  return title.length > LONGEST_TITLE ? `${title.slice(0, LONGEST_TITLE - 1).trimEnd()}…` : title;
}

const OPENING_ICON = (
  <>
    <path d="M5 20V5h9l-1 3 1 3H5" />
    <path d="M5 20h14" />
  </>
);

const ENDING_ICON = (
  <>
    <path d="M6 21V4" />
    <path d="M6 4h11l-2.5 4L17 12H6" />
  </>
);

const CHOICE_ICON = (
  <>
    <circle cx="6" cy="6" r="2" />
    <circle cx="6" cy="18" r="2" />
    <circle cx="18" cy="9" r="2" />
    <path d="M6 8v8M6 14c0-3 2-5 6-5h4" />
  </>
);
