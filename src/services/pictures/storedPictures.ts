import { z } from "zod";

const StoredPictures = z.record(z.string(), z.string().startsWith("data:image/"));

export function readStoredPictures(scriptId: string) {
  try {
    const saved = sessionStorage.getItem(toKey(scriptId));
    const parsed = StoredPictures.safeParse(saved ? JSON.parse(saved) : {});
    return new Map(Object.entries(parsed.success ? parsed.data : {}));
  } catch {
    return new Map<string, string>();
  }
}

export function storePictures(scriptId: string, pictures: Map<string, string>) {
  try {
    sessionStorage.setItem(toKey(scriptId), JSON.stringify(Object.fromEntries(pictures)));
  } catch {
    return;
  }
}

function toKey(scriptId: string) {
  return `castwave-pictures-${scriptId}`;
}
