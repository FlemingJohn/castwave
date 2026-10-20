import type { StoryMapLayout } from "@/components/preparing/StoryMap/StoryMapLayout";

export type StoryMapEdgeProps = {
  edge: StoryMapLayout["edges"][number];
  isTaken: boolean;
};
