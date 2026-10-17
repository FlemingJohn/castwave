import { z } from "zod";

export const SpeechCue = z.object({
  kind: z.literal("speech"),
  speaker: z.string().min(1),
  text: z.string().min(1),
  startsParagraph: z.boolean(),
});
export type SpeechCue = z.infer<typeof SpeechCue>;
