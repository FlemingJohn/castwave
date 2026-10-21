import "server-only";
import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";
import { PageNotReadableError } from "@/server/errors/PageNotReadableError";

const TIME_LIMIT_IN_MILLISECONDS = 10000;
const PAGE_SIZE_LIMIT = 3_000_000;
const SHORTEST_ARTICLE = 300;
const PRIVATE_HOST =
  /^(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|\[?::1\]?$)|\.(local|internal)$/i;

export async function readPage(address: string) {
  const url = new URL(address);
  if (!["http:", "https:"].includes(url.protocol) || PRIVATE_HOST.test(url.hostname)) {
    throw new PageNotReadableError("only public http and https addresses can be read");
  }
  const response = await fetchPage(url);
  if (!response.ok) {
    throw new PageNotReadableError(`the site answered HTTP ${response.status}`);
  }
  const html = (await response.text()).slice(0, PAGE_SIZE_LIMIT);
  const { document } = parseHTML(html);
  const article = new Readability(document).parse();
  const text = article && article.content ? getParagraphs(article.content).join("\n\n") : "";
  if (text.length < SHORTEST_ARTICLE) {
    throw new PageNotReadableError("no article text was found on it, it may need a login or JavaScript");
  }
  return { title: article && article.title ? article.title : url.hostname, text };
}

async function fetchPage(url: URL) {
  try {
    return await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; Castwave/1.0)", accept: "text/html" },
      signal: AbortSignal.timeout(TIME_LIMIT_IN_MILLISECONDS),
      cache: "no-store",
    });
  } catch (error) {
    const isTimeout = error instanceof DOMException && error.name === "TimeoutError";
    throw new PageNotReadableError(
      isTimeout ? "the site didn't answer within 10 seconds" : "the site could not be reached, check the address",
    );
  }
}

function getParagraphs(articleHtml: string) {
  const { document } = parseHTML(`<html><body>${articleHtml}</body></html>`);
  return [...document.querySelectorAll("p, h2, h3, li")]
    .map((node) =>
      (node.textContent ?? "")
        .replace(/\[\d+\]/g, "")
        .replace(/\s+/g, " ")
        .trim(),
    )
    .filter((paragraph) => paragraph.length > 40);
}
