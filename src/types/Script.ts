import { z } from "zod";
import { AmbienceName } from "./AmbienceName";
import { Character } from "./Character";
import { Scene } from "./Scene";
import { ScriptFormat } from "./ScriptFormat";

export const Script = z.object({
  title: z.string().min(1),
  format: ScriptFormat,
  ambience: AmbienceName.optional(),
  cast: Character.array().min(1),
  firstSceneId: z.string().min(1),
  scenes: Scene.array().min(1),
});
export type Script = z.infer<typeof Script>;
