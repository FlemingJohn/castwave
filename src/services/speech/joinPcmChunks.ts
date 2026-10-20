import { SPEECH_SAMPLE_RATE } from "./speechSampleRate";

export function joinPcmChunks(base64Chunks: string[]) {
  const parts = base64Chunks.map((chunk) => {
    const bytes = Uint8Array.from(atob(chunk), (character) => character.charCodeAt(0));
    return new Int16Array(bytes.buffer);
  });
  const length = parts.reduce((total, part) => total + part.length, 0);
  const buffer = new AudioBuffer({ length: Math.max(1, length), numberOfChannels: 1, sampleRate: SPEECH_SAMPLE_RATE });
  const channel = buffer.getChannelData(0);
  let offset = 0;
  for (const part of parts) {
    part.forEach((sample, index) => {
      channel[offset + index] = sample / 32768;
    });
    offset += part.length;
  }
  return buffer;
}
