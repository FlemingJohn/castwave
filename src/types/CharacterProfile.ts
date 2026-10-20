import { z } from "zod";

export const CharacterProfile = z.object({
  name: z.string().trim().min(1),
  gender: z.enum(["female", "male", "unknown"]).catch("unknown"),
  age: z.enum(["child", "young", "adult", "old"]).catch("adult"),
});
export type CharacterProfile = z.infer<typeof CharacterProfile>;
