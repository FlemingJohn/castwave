import type { Choice } from "@/types/Choice";

export type ChoiceCardProps = {
  question: string;
  choices: Choice[];
  onChoose: (choice: Choice) => void;
};
