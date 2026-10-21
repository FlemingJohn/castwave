import { z } from "zod";
import { Script } from "./Script";

const RelativePath = z.string().regex(/^[a-z0-9-]+\/[a-z0-9-]+\.(mp3|jpg)$/);

export const ShowcaseStory = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  madeOn: z.string().min(1),
  script: Script,
  lines: z.record(z.string(), z.object({ audio: RelativePath, wordStarts: z.number().array() })),
  pictures: z.record(z.string(), RelativePath),
});
export type ShowcaseStory = z.infer<typeof ShowcaseStory>;
