import { z } from "zod";

export const ReplyDoneEvent = z.object({
  type: z.literal("reply.done"),
});
export type ReplyDoneEvent = z.infer<typeof ReplyDoneEvent>;
