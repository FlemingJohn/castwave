import { useSyncExternalStore } from "react";
import type { VoicingJob } from "@/services/voicing/VoicingJob";

export function useVoicing(job: VoicingJob | null) {
  return useSyncExternalStore(job ? job.subscribe : subscribeToNothing, job ? job.getProgress : getNothing, getNothing);
}

function subscribeToNothing() {
  return () => {};
}

function getNothing() {
  return null;
}
