import { z } from "zod";
import { AmbienceName } from "./AmbienceName";

export const PictureRequest = z.object({
  storyTitle: z.string().trim().min(1).max(200),
  sceneTitle: z.string().trim().min(1).max(200),
  sceneText: z.string().trim().max(400),
  ambience: AmbienceName.optional(),
  seed: z.number().int().min(0).max(999999),
});
export type PictureRequest = z.infer<typeof PictureRequest>;
