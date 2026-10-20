import "server-only";
import type { AmbienceName } from "@/types/AmbienceName";
import type { PictureRequest } from "@/types/PictureRequest";

const HOUSE_STYLE =
  "moody cinematic illustration, painterly, soft lavender and indigo light, deep night shadows, wide shot, no text, no letters, no watermark";

export function writePicturePrompt(request: PictureRequest) {
  const setting = request.ambience ? SETTING_BY_AMBIENCE[request.ambience] : "";
  return [request.sceneTitle, request.sceneText, setting, `from the story "${request.storyTitle}"`, HOUSE_STYLE]
    .filter(Boolean)
    .join(". ");
}

const SETTING_BY_AMBIENCE: Record<AmbienceName, string> = {
  rain: "heavy rain falling, wet reflections, a stormy rainy night",
  wind: "a windswept night, leaves and dust blowing",
  fire: "warm firelight flickering against the dark",
  forest: "a dark forest, tall trees, mist between the trunks",
  city: "a city at night, street lamps, distant lit windows",
};
