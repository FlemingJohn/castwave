import type { PerformanceSnapshot } from "@/components/studio/ScriptPreview/PerformanceSnapshot";
import type { ScriptRow } from "@/components/studio/ScriptPreview/ScriptRow";

export type ScriptLinesProps = {
  rows: ScriptRow[];
  snapshot: PerformanceSnapshot;
  onPlay: (position: number) => void;
};
