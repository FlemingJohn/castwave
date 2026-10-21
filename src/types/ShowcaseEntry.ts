import { z } from "zod";
import { ScriptFormat } from "./ScriptFormat";

export const ShowcaseEntry = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  format: ScriptFormat,
  cover: z
    .string()
    .regex(/^[a-z0-9-]+\/pictures\/[a-z0-9-]+\.jpg$/)
    .optional(),
  details: z.string().array(),
  cast: z.string().array(),
});
export type ShowcaseEntry = z.infer<typeof ShowcaseEntry>;
