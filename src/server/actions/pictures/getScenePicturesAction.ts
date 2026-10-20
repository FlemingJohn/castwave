"use server";

import { settings } from "@/server/config/settings";
import { PictureError } from "@/server/errors/PictureError";
import { paintScene } from "@/server/services/pictures/paintScene";
import { writePicturePrompt } from "@/server/services/pictures/writePicturePrompt";
import { PictureRequest } from "@/types/PictureRequest";
import type { PictureResult } from "@/types/PictureResult";

const MAX_SCENES = 12;

export async function getScenePicturesAction(inputs: PictureRequest[]): Promise<PictureResult[]> {
  const apiKey = settings.pollinationsApiKey;
  const requests = PictureRequest.array().max(MAX_SCENES).parse(inputs);
  if (!apiKey) {
    return requests.map(() => ({ status: "skipped" }));
  }
  return Promise.all(requests.map((request) => paintOne(request, apiKey)));
}

async function paintOne(request: PictureRequest, apiKey: string): Promise<PictureResult> {
  try {
    const url = await paintScene(writePicturePrompt(request), request.seed, apiKey);
    return { status: "ready", url };
  } catch (error) {
    if (error instanceof PictureError || (error instanceof Error && error.name === "TimeoutError")) {
      return { status: "failed", message: error.message };
    }
    throw error;
  }
}
