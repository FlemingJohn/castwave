import type { Script } from "@/types/Script";
import { VoicingJob } from "./VoicingJob";

let currentJob: VoicingJob | null = null;

export function getVoicingJob(script: Script) {
  if (currentJob && currentJob.scriptId === script.id) {
    return currentJob;
  }
  currentJob?.stop();
  currentJob = new VoicingJob(script);
  return currentJob;
}
