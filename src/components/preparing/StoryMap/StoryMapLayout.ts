import type { Scene } from "@/types/Scene";

export type StoryMapNode = {
  scene: Scene;
  x: number;
  y: number;
  lockedTitle: string;
};

export type StoryMapLayout = {
  nodes: StoryMapNode[];
  edges: { from: StoryMapNode; to: StoryMapNode; choiceNumber: number }[];
  width: number;
  height: number;
};
