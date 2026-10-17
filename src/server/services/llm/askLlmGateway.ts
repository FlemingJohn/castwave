import "server-only";
import { z } from "zod";
import { settings } from "@/server/config/settings";
import { LlmGatewayError } from "@/server/errors/LlmGatewayError";

const GATEWAY_URL = "https://llm-gateway.assemblyai.com/v1/chat/completions";
const MODEL = "qwen3.5-4b-32k-fast";

export async function askLlmGateway(instructions: string, request: string) {
  const response = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: { authorization: settings.assemblyAiApiKey, "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 8000,
      temperature: 0.2,
      messages: [
        { role: "system", content: instructions },
        { role: "user", content: request },
      ],
    }),
  });
  if (!response.ok) {
    throw new LlmGatewayError(`LLM Gateway answered HTTP ${response.status}`);
  }
  const reply = GatewayReply.parse(await response.json());
  const content = reply.choices[0]?.message.content;
  if (!content) {
    throw new LlmGatewayError("LLM Gateway sent an empty reply");
  }
  return content;
}

const GatewayReply = z.object({
  choices: z.array(
    z.object({
      message: z.object({ content: z.string().nullable() }),
    }),
  ),
});
