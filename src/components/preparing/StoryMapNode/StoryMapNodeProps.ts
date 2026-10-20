import type { StoryMapNode } from "@/components/preparing/StoryMap/StoryMapLayout";

export type StoryMapNodeProps = {
  node: StoryMapNode;
  isOpening: boolean;
  isVisited: boolean;
  isFound: boolean;
  voicing: { done: number; total: number } | undefined;
};
