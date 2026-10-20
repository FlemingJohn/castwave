import type { SoundName } from "./SoundName";

export type CueEffect = Extract<SoundName, "thunder" | "door_slam" | "heartbeat">;
