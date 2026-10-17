export type CueRowProps = {
  speaker: string;
  voice: string;
  text: string;
  colourNumber: number;
  startsParagraph: boolean;
  isPlaying: boolean;
  onPlay: () => void;
};
