import type { ScriptSource } from "@/types/ScriptSource";

export type SourceTabsProps = {
  source: ScriptSource["kind"];
  onPick: (source: ScriptSource["kind"]) => void;
};
