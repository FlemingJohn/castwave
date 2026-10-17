import { z } from "zod";

export const SessionErrorEvent = z.object({
  type: z.literal("session.error"),
  code: z.string(),
  message: z.string(),
});
export type SessionErrorEvent = z.infer<typeof SessionErrorEvent>;
