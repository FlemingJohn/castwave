import type { VoicingJob } from "@/services/voicing/VoicingJob";
import type { Script } from "@/types/Script";

export type ScriptPlayerProps = {
  script: Script;
  job: VoicingJob;
  onScriptChange: (script: Script) => void;
};
