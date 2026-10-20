import "server-only";
import { z } from "zod";
import { settings } from "@/server/config/settings";
import { LlmGatewayError } from "@/server/errors/LlmGatewayError";

const GATEWAY_URL = "https://llm-gateway.assemblyai.com/v1/chat/completions";
const MODEL = "qwen3.5-4b-32k-fast";
const RATE_LIMITED = 429;
const LONGEST_WAIT_IN_SECONDS = 45;

export async function askLlmGateway(instructions: string, request: string, maxTokens: number) {
  let response = await sendRequest(instructions, request, maxTokens);
  for (let attempt = 1; response.status === RATE_LIMITED && attempt <= 2; attempt++) {
    await waitForReset(response);
    response = await sendRequest(instructions, request, maxTokens);
  }
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

function sendRequest(instructions: string, request: string, maxTokens: number) {
  return fetch(GATEWAY_URL, {
    method: "POST",
    headers: { authorization: settings.assemblyAiApiKey, "content-type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature: 0.2,
      messages: [
        { role: "system", content: instructions },
        { role: "user", content: request },
      ],
    }),
  });
}

async function waitForReset(response: Response) {
  const resetInSeconds = Number(response.headers.get("x-ratelimit-reset-tokens") ?? response.headers.get("x-ratelimit-reset") ?? 10);
  const waitInSeconds = Math.min(LONGEST_WAIT_IN_SECONDS, Math.max(2, resetInSeconds + 1));
  console.warn(`LLM Gateway rate limit reached, waiting ${waitInSeconds}s`);
  await new Promise((resolve) => setTimeout(resolve, waitInSeconds * 1000));
}

const GatewayReply = z.object({
  choices: z.array(
    z.object({
      message: z.object({ content: z.string().nullable() }),
    }),
  ),
});
