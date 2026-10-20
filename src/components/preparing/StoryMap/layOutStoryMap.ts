import type { Scene } from "@/types/Scene";
import type { StoryMapLayout } from "./StoryMapLayout";
import { STORY_NODE_HEIGHT, STORY_NODE_WIDTH } from "./storyNodeSize";

const COLUMN_GAP = 330;
const ROW_GAP = 78;

export function layOutStoryMap(scenes: Scene[], firstSceneId: string): StoryMapLayout {
  const columns = collectColumns(scenes, firstSceneId);
  const tallest = Math.max(...columns.map((column) => column.length));
  const height = (tallest - 1) * ROW_GAP + STORY_NODE_HEIGHT;
  let endingNumber = 0;
  const nodes = columns.flatMap((column, depth) => {
    const top = (height - ((column.length - 1) * ROW_GAP + STORY_NODE_HEIGHT)) / 2;
    return column.map((scene, row) => {
      endingNumber += scene.ending ? 1 : 0;
      const lockedTitle = getLockedTitle(scene, depth, row, endingNumber);
      return {
        scene,
        x: depth * COLUMN_GAP,
        y: top + row * ROW_GAP,
        lockedTitle,
      };
    });
  });
  const edges = nodes.flatMap((from) =>
    from.scene.choices.flatMap((choice, choiceNumber) => {
      const to = nodes.find((node) => node.scene.id === choice.nextSceneId);
      return to ? [{ from, to, choiceNumber }] : [];
    }),
  );
  return {
    nodes,
    edges,
    width: (columns.length - 1) * COLUMN_GAP + STORY_NODE_WIDTH + 2,
    height: height + 2,
  };
}

function collectColumns(scenes: Scene[], firstSceneId: string) {
  const placed = new Set<string>();
  const columns: Scene[][] = [];
  let current = scenes.filter((scene) => scene.id === firstSceneId);
  while (current.length > 0) {
    current.forEach((scene) => placed.add(scene.id));
    columns.push(current);
    const nextIds = current.flatMap((scene) => scene.choices.map((choice) => choice.nextSceneId));
    current = scenes.filter((scene) => nextIds.includes(scene.id) && !placed.has(scene.id));
  }
  return columns;
}

function getLockedTitle(scene: Scene, depth: number, row: number, endingNumber: number) {
  if (depth === 0) {
    return "Opening";
  }
  if (scene.ending) {
    return `Ending ${endingNumber}`;
  }
  return depth === 1 ? `Path ${String.fromCharCode(65 + row)}` : `Scene ${depth + 1}`;
}
