import "server-only";
import { PictureError } from "@/server/errors/PictureError";

const PICTURE_URL = "https://gen.pollinations.ai/image/";
const PICTURE_MODEL = "tongyi-mai/z-image-turbo";
const PICTURE_WIDTH = 1024;
const PICTURE_HEIGHT = 576;
const TIMEOUT_MILLISECONDS = 60000;

export async function paintScene(prompt: string, seed: number, apiKey: string) {
  const url = new URL(PICTURE_URL + encodeURIComponent(prompt));
  url.searchParams.set("model", PICTURE_MODEL);
  url.searchParams.set("width", String(PICTURE_WIDTH));
  url.searchParams.set("height", String(PICTURE_HEIGHT));
  url.searchParams.set("seed", String(seed));
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
    signal: AbortSignal.timeout(TIMEOUT_MILLISECONDS),
  });
  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || !contentType.startsWith("image/")) {
    throw new PictureError(response.status, await readReason(response));
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${bytes.toString("base64")}`;
}

async function readReason(response: Response) {
  const text = await response.text().catch(() => "");
  const match = text.match(/"message"\s*:\s*"([^"]+)"/);
  return match?.[1] ?? "";
}
