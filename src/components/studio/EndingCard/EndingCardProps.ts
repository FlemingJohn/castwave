import type { Script } from "@/types/Script";

export type EndingCardProps = {
  script: Script;
  endingTitle: string;
  visitedSceneIds: string[];
  foundEndingIds: string[];
  onRestart: () => void;
};
