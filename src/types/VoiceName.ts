import { z } from "zod";

export const VoiceName = z.enum([
  "alba",
  "eve",
  "george",
  "jane",
  "jean",
  "mary",
  "michael",
  "anna",
  "charles",
  "paul",
  "vera",
  "giovanni",
  "lola",
  "juergen",
  "rafael",
  "estelle",
]);
export type VoiceName = z.infer<typeof VoiceName>;
