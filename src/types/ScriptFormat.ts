import { z } from "zod";

export const ScriptFormat = z.enum(["audiobook", "podcast", "interactive"]);
export type ScriptFormat = z.infer<typeof ScriptFormat>;
