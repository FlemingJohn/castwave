import { useSyncExternalStore } from "react";
import type { PictureJob } from "@/services/pictures/PictureJob";

export function usePictures(job: PictureJob | null) {
  return useSyncExternalStore(job ? job.subscribe : subscribeToNothing, job ? job.getProgress : getNothing, getNothing);
}

function subscribeToNothing() {
  return () => {};
}

function getNothing() {
  return null;
}
