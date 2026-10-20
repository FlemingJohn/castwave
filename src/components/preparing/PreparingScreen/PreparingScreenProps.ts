import type { Script } from "@/types/Script";
import type { VoicingProgress } from "@/types/VoicingProgress";

export type PreparingScreenProps = {
  script: Script | null;
  progress: VoicingProgress | null;
  openLabel: string;
  onOpen: () => void;
  onPlayNow: () => void;
};
