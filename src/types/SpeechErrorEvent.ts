import { z } from "zod";

export const SpeechErrorEvent = z.object({
  type: z.literal("Error"),
  error_code: z.number(),
  error: z.string(),
});
export type SpeechErrorEvent = z.infer<typeof SpeechErrorEvent>;
