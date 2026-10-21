import { z } from "zod";
import { MAX_TEXT_CHARACTERS } from "./sourceLimits";

const Minutes = z.number().int().min(1).max(3);

export const ScriptSource = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("text"), text: z.string().trim().min(1).max(MAX_TEXT_CHARACTERS), minutes: Minutes }),
  z.object({ kind: z.literal("link"), url: z.url(), minutes: Minutes }),
  z.object({ kind: z.literal("idea"), idea: z.string().trim().min(1), minutes: Minutes }),
]);
export type ScriptSource = z.infer<typeof ScriptSource>;
