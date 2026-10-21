import type { Script } from "@/types/Script";

export function countSceneLevels(script: Script) {
  let levels = 0;
  let current = [script.firstSceneId];
  const seen = new Set<string>();
  while (current.length > 0) {
    levels += 1;
    current.forEach((sceneId) => seen.add(sceneId));
    current = script.scenes
      .filter((scene) => current.includes(scene.id))
      .flatMap((scene) => scene.choices.map((choice) => choice.nextSceneId))
      .filter((sceneId) => !seen.has(sceneId));
  }
  return levels;
}
