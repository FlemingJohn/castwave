import { z } from "zod";

export const SpeechAudioEvent = z.object({
  type: z.literal("Audio"),
  audio: z.string(),
});
export type SpeechAudioEvent = z.infer<typeof SpeechAudioEvent>;
