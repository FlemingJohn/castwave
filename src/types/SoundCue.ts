import { z } from "zod";

export const SoundCue = z.object({
  kind: z.literal("sound"),
  sound: z.string().min(1),
  description: z.string().min(1),
  startsParagraph: z.boolean(),
});
export type SoundCue = z.infer<typeof SoundCue>;
