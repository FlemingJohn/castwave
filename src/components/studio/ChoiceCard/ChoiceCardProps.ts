import type { Choice } from "@/types/Choice";

export type ChoiceCardProps = {
  question: string;
  choices: Choice[];
  isVoiceMode: boolean;
  onVoiceModeChange: (isVoiceMode: boolean) => void;
  onChoose: (choice: Choice) => void;
};
