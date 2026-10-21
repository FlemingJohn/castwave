import { ShowcaseStory } from "@/types/ShowcaseStory";

const stories = new Map<string, Promise<ShowcaseStory>>();

export function loadShowcaseStory(slug: string) {
  const known = stories.get(slug);
  if (known) {
    return known;
  }
  const loading = fetch(`/showcase/${slug}/story.json`).then(async (response) => {
    if (!response.ok) {
      throw new Error(`The showcase story "${slug}" could not be loaded (HTTP ${response.status}).`);
    }
    return ShowcaseStory.parse(await response.json());
  });
  stories.set(slug, loading);
  loading.catch(() => stories.delete(slug));
  return loading;
}
