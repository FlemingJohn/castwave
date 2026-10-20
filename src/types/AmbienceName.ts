import { z } from "zod";

export const AmbienceName = z.enum(["rain", "wind", "fire", "forest", "city"]);
export type AmbienceName = z.infer<typeof AmbienceName>;
