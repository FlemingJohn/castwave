import { z } from "zod";
import { CharacterProfile } from "./CharacterProfile";

export const CharacterProfiles = z.object({
  characters: z.array(CharacterProfile),
});
export type CharacterProfiles = z.infer<typeof CharacterProfiles>;
