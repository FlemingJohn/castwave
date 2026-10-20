export type VoicingProgress = {
  status: "voicing" | "ready" | "failed";
  errorMessage: string;
  linesDone: number;
  linesTotal: number;
  audioSeconds: number;
  characters: { name: string; done: number; total: number }[];
  scenes: { id: string; done: number; total: number }[];
};
