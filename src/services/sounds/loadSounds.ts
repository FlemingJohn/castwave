import { AmbienceName } from "@/types/AmbienceName";
import type { SoundName } from "@/types/SoundName";

const LONGEST_SOUND_IN_SECONDS = 3.5;
const FADE_OUT_IN_SECONDS = 0.4;

export async function loadSounds(audio: AudioContext, names: (SoundName | AmbienceName)[]) {
  const loaded = await Promise.all(
    names.map(async (name) => {
      const response = await fetch(`/sounds/${FILE_BY_SOUND[name]}`);
      const buffer = await audio.decodeAudioData(await response.arrayBuffer());
      const isAmbience = AmbienceName.safeParse(name).success;
      return [name, isAmbience ? buffer : shorten(audio, buffer)] as const;
    }),
  );
  return new Map<SoundName | AmbienceName, AudioBuffer>(loaded);
}

function shorten(audio: AudioContext, buffer: AudioBuffer) {
  if (buffer.duration <= LONGEST_SOUND_IN_SECONDS) {
    return buffer;
  }
  const length = Math.round(LONGEST_SOUND_IN_SECONDS * buffer.sampleRate);
  const fadeLength = Math.round(FADE_OUT_IN_SECONDS * buffer.sampleRate);
  const shortened = audio.createBuffer(buffer.numberOfChannels, length, buffer.sampleRate);
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const samples = buffer.getChannelData(channel).slice(0, length);
    for (let index = length - fadeLength; index < length; index++) {
      samples[index] = (samples[index] ?? 0) * ((length - index) / fadeLength);
    }
    shortened.copyToChannel(samples, channel);
  }
  return shortened;
}

const FILE_BY_SOUND: Record<SoundName | AmbienceName, string> = {
  door_knock: "door_knock.ogg",
  door_creak: "door_creak.ogg",
  door_close: "door_close.ogg",
  door_slam: "door_slam.wav",
  footsteps: "footsteps.ogg",
  glass_break: "glass_break.wav",
  heartbeat: "heartbeat.ogg",
  clock_ticking: "clock_ticking.ogg",
  scream: "scream.ogg",
  thunder: "thunder.ogg",
  rain: "rain.ogg",
  wind: "wind.ogg",
  fire: "fire.ogg",
  forest: "forest.ogg",
  city: "city.ogg",
};
