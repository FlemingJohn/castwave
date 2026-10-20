import type { PictureJob } from "@/services/pictures/PictureJob";
import type { VoicingJob } from "@/services/voicing/VoicingJob";
import type { Script } from "@/types/Script";

export type ScriptPlayerProps = {
  script: Script;
  job: VoicingJob;
  pictureJob: PictureJob;
  onScriptChange: (script: Script) => void;
};
