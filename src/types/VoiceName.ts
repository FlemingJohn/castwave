import { z } from "zod";

export const VoiceName = z.enum([
  "alba",
  "anna",
  "charles",
  "eve",
  "george",
  "iris",
  "jane",
  "jean",
  "mary",
  "michael",
  "paul",
  "reid",
  "vera",
  "estelle",
  "giovanni",
  "juergen",
  "lola",
  "rafael",
]);
export type VoiceName = z.infer<typeof VoiceName>;
