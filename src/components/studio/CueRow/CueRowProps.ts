import type { CueStatus } from "@/types/CueStatus";

export type CueRowProps = {
  speaker: string;
  voice: string;
  text: string;
  colourNumber: number;
  startsParagraph: boolean;
  status: CueStatus;
  spokenWordCount: number;
  onPlay: () => void;
};
