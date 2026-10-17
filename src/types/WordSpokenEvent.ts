import { z } from "zod";

export const WordSpokenEvent = z.object({
  type: z.literal("transcript.agent.delta"),
  delta: z.string(),
  start_ms: z.number(),
  end_ms: z.number(),
});
export type WordSpokenEvent = z.infer<typeof WordSpokenEvent>;
