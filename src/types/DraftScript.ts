import { z } from "zod";
import { DraftLine } from "./DraftLine";

export const DraftScript = z.object({
  title: z.string().trim().min(1),
  lines: z.array(DraftLine).min(1),
});
export type DraftScript = z.infer<typeof DraftScript>;
