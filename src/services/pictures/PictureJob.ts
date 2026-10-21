import { getScenePicturesAction } from "@/server/actions/pictures/getScenePicturesAction";
import type { PictureRequest } from "@/types/PictureRequest";
import type { PicturesProgress } from "@/types/PicturesProgress";
import type { Scene } from "@/types/Scene";
import type { Script } from "@/types/Script";
import { loadShowcaseStory } from "@/services/showcase/loadShowcaseStory";
import { readStoredPictures, storePictures } from "./storedPictures";

const SCENE_TEXT_LENGTH = 300;

export class PictureJob {
  readonly scriptId: string;
  private readonly pictures: Map<string, string>;
  private readonly listeners = new Set<() => void>();
  private progress: PicturesProgress;

  constructor(script: Script) {
    this.scriptId = script.id;
    this.pictures = readStoredPictures(script.id);
    this.progress = { status: "painting", done: this.pictures.size, failed: 0, total: script.scenes.length };
    void (script.showcase ? this.loadShowcase(script.showcase) : this.paintMissing(script));
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getProgress = () => this.progress;

  getPicture(sceneId: string) {
    return this.pictures.get(sceneId);
  }

  private async loadShowcase(slug: string) {
    const story = await loadShowcaseStory(slug).catch(() => null);
    Object.entries(story?.pictures ?? {}).forEach(([sceneId, path]) =>
      this.pictures.set(sceneId, `/showcase/${slug}/${path}`),
    );
    this.update({ status: "done", done: this.pictures.size, failed: this.progress.total - this.pictures.size });
  }

  private async paintMissing(script: Script) {
    const missing = script.scenes.filter((scene) => !this.pictures.has(scene.id));
    if (missing.length === 0) {
      this.update({ status: "done" });
      return;
    }
    const results = await getScenePicturesAction(missing.map((scene) => toRequest(script, scene))).catch(() => []);
    if (results.some((result) => result.status === "skipped")) {
      this.update({ status: "off" });
      return;
    }
    missing.forEach((scene, position) => {
      const result = results[position];
      if (result?.status === "ready") {
        this.pictures.set(scene.id, result.url);
      }
    });
    storePictures(this.scriptId, this.pictures);
    this.update({ status: "done", done: this.pictures.size, failed: script.scenes.length - this.pictures.size });
  }

  private update(change: Partial<PicturesProgress>) {
    this.progress = { ...this.progress, ...change };
    [...this.listeners].forEach((listener) => listener());
  }
}

function toRequest(script: Script, scene: Scene): PictureRequest {
  const narration = scene.cues.flatMap((cue) =>
    cue.kind === "speech" && cue.speaker === "Narrator" ? [cue.text] : [],
  );
  return {
    storyTitle: script.title,
    sceneTitle: scene.ending ?? scene.title,
    sceneText: narration.join(" ").slice(0, SCENE_TEXT_LENGTH),
    ambience: script.ambience,
    seed: toSeed(script.id),
  };
}

function toSeed(scriptId: string) {
  return [...scriptId].reduce((total, character) => (total * 31 + character.charCodeAt(0)) % 999999, 7);
}
