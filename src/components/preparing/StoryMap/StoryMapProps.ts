import type { Scene } from "@/types/Scene";
import type { VoicingProgress } from "@/types/VoicingProgress";

export type StoryMapProps = {
  scenes: Scene[];
  firstSceneId: string;
  progress: VoicingProgress | null;
  visitedSceneIds: string[];
  foundEndingIds: string[];
  getPicture?: (sceneId: string) => string | undefined;
};
