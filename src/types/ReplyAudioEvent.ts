import { z } from "zod";

export const ReplyAudioEvent = z.object({
  type: z.literal("reply.audio"),
  data: z.string(),
});
export type ReplyAudioEvent = z.infer<typeof ReplyAudioEvent>;
