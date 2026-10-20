import { z } from "zod";
import { SoundName } from "./SoundName";

export const SoundCue = z.object({
  kind: z.literal("sound"),
  sound: SoundName,
  description: z.string().min(1),
  startsParagraph: z.boolean(),
});
export type SoundCue = z.infer<typeof SoundCue>;
