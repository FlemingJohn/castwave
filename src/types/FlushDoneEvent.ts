import { z } from "zod";

export const FlushDoneEvent = z.object({
  type: z.literal("FlushDone"),
  flush_id: z.number(),
  audio_duration_ms: z.number(),
});
export type FlushDoneEvent = z.infer<typeof FlushDoneEvent>;
