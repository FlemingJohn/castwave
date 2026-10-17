import "server-only";
import { z } from "zod";
import { settings } from "@/server/config/settings";
import { VoiceTokenError } from "@/server/errors/VoiceTokenError";

export async function createVoiceToken() {
  const url = new URL("https://agents.assemblyai.com/v1/token");
  url.searchParams.set("expires_in_seconds", "120");
  url.searchParams.set("max_session_duration_seconds", "120");
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${settings.assemblyAiApiKey}` },
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
