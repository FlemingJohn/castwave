import type { PerformanceLine } from "./PerformanceLine";

export type ScriptRow = {
  label: string;
  detail: string;
  text: string;
  colourNumber: number;
  heading?: string;
  performanceLine: PerformanceLine;
};
