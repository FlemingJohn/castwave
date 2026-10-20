import "server-only";

export class PictureError extends Error {
  constructor(status: number, detail: string) {
    super(`Pollinations could not paint the scene (HTTP ${status}). ${detail}`.trim());
    this.name = "PictureError";
  }
}
