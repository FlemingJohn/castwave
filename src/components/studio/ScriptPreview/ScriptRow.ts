import type { PerformanceLine } from "./PerformanceLine";

export type ScriptRow = {
  sceneId: string;
  label: string;
  detail: string;
  text: string;
  colourNumber: number;
  heading?: string;
  performanceLine: PerformanceLine;
};
