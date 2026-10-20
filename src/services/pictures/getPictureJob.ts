import type { Script } from "@/types/Script";
import { PictureJob } from "./PictureJob";

let currentJob: PictureJob | null = null;

export function getPictureJob(script: Script) {
  if (currentJob && currentJob.scriptId === script.id) {
    return currentJob;
  }
  currentJob = new PictureJob(script);
  return currentJob;
}
