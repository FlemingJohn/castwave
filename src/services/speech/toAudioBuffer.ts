import { SPEECH_SAMPLE_RATE } from "./speechSampleRate";

export function toAudioBuffer(audio: AudioContext, base64: string) {
  const bytes = Uint8Array.from(atob(base64), (character) => character.charCodeAt(0));
  const samples = new Int16Array(bytes.buffer);
  const buffer = audio.createBuffer(1, samples.length, SPEECH_SAMPLE_RATE);
  const channel = buffer.getChannelData(0);
  samples.forEach((sample, index) => {
    channel[index] = sample / 32768;
  });
  return buffer;
}
