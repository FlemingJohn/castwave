import { z } from "zod";

export const SpeechEndedEvent = z.object({
  type: z.literal("Termination"),
  audio_duration_seconds: z.number(),
});
export type SpeechEndedEvent = z.infer<typeof SpeechEndedEvent>;
