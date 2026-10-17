import "server-only";
import { z } from "zod";

const Settings = z.object({
  ASSEMBLYAI_API_KEY: z.string().min(1),
});

const environment = Settings.parse(process.env);

export const settings = {
  assemblyAiApiKey: environment.ASSEMBLYAI_API_KEY,
};
