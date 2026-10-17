import { z } from "zod";

export const SpeechBeginEvent = z.object({
  type: z.literal("Begin"),
});
export type SpeechBeginEvent = z.infer<typeof SpeechBeginEvent>;
