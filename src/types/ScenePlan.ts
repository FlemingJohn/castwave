import type { Choice } from "./Choice";

export type ScenePlan = {
  id: string;
  title: string;
  summary: string;
  storySoFar: string[];
  question?: string;
  choices: Choice[];
  ending?: string;
};
