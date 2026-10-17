import "server-only";

export class VoiceTokenError extends Error {
  constructor(status: number) {
    super(`AssemblyAI refused to make a voice token (HTTP ${status}). Check ASSEMBLYAI_API_KEY in .env.local.`);
    this.name = "VoiceTokenError";
  }
}
