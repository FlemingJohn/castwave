import { z } from "zod";

export const ScriptSource = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text"), text: z.string().trim().min(1) }),
  z.object({ kind: z.literal("link"), url: z.url() }),
  z.object({ kind: z.literal("idea"), idea: z.string().trim().min(1), minutes: z.number().int().min(1).max(10) }),
]);
export type ScriptSource = z.infer<typeof ScriptSource>;
