import { ShowcaseEntry } from "@/types/ShowcaseEntry";

export async function loadShowcaseShelf() {
  const response = await fetch("/showcase/index.json");
  if (!response.ok) {
    return [];
  }
  const entries = ShowcaseEntry.array().safeParse(await response.json());
  return entries.success ? entries.data : [];
}
