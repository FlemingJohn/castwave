import "server-only";

export class LlmGatewayError extends Error {
  constructor(problem: string) {
    super(`The script couldn't be written: ${problem}. Try again in a moment.`);
    this.name = "LlmGatewayError";
  }
}
