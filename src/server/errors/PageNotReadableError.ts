import "server-only";

export class PageNotReadableError extends Error {
  constructor(problem: string) {
    super(`This page couldn't be read: ${problem}. Try another link, or copy the article text into the Paste text tab.`);
    this.name = "PageNotReadableError";
  }
}
