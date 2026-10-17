import "server-only";

export class NotBuiltYetError extends Error {
  constructor(feature: string) {
    super(`${feature} isn't built yet. For now, paste text or use an idea, with the audiobook or podcast format.`);
    this.name = "NotBuiltYetError";
  }
}
