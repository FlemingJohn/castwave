import { z } from "zod";

export const SessionEndedEvent = z.object({
  type: z.literal("session.ended"),
});
export type SessionEndedEvent = z.infer<typeof SessionEndedEvent>;
