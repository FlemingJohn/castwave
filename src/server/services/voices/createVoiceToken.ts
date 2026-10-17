import "server-only";
import { z } from "zod";
import { settings } from "@/server/config/settings";
import { VoiceTokenError } from "@/server/errors/VoiceTokenError";

export async function createVoiceToken() {
  const url = new URL("https://streaming.assemblyai.com/v3/token");
  url.searchParams.set("expires_in_seconds", "60");
  const response = await fetch(url, {
    headers: { Authorization: settings.assemblyAiApiKey },
    cache: "no-store",
  });
  if (!response.ok) {
    throw new VoiceTokenError(response.status);
  }
  const tokenResponse = TokenResponse.parse(await response.json());
  return tokenResponse.token;
}

const TokenResponse = z.object({
  token: z.string().min(1),
});
