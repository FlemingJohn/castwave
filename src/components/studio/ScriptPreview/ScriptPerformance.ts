import type { VoicingJob } from "@/services/voicing/VoicingJob";
import type { AmbienceName } from "@/types/AmbienceName";
import type { CueStatus } from "@/types/CueStatus";
import type { PerformanceLine } from "./PerformanceLine";
import type { PerformanceSetup } from "./PerformanceSetup";
import type { PerformanceSnapshot } from "./PerformanceSnapshot";

const LINE_GAP_SECONDS = 0.16;
const PARAGRAPH_GAP_SECONDS = 0.45;
const START_DELAY_SECONDS = 0.1;
const AMBIENCE_VOLUME = 0.16;
const AMBIENCE_FADE_SECONDS = 1.5;

export class ScriptPerformance {
  private readonly audio: AudioContext;
  private readonly lines: PerformanceLine[];
  private readonly job: VoicingJob;
  private readonly cues: CueTiming[];
  private readonly sources: AudioBufferSourceNode[] = [];
  private ambienceVolume: GainNode | null = null;
  private stopWaiting: (() => void) | null = null;
  private schedulingPosition: number;
  private nextStartTime: number;

  constructor(setup: PerformanceSetup) {
    this.audio = setup.audio;
    this.lines = setup.lines;
    this.job = setup.job;
    this.cues = setup.lines.map((_, position) => (position < setup.firstPosition ? playedCue() : waitingCue()));
    this.schedulingPosition = setup.firstPosition;
    this.nextStartTime = setup.audio.currentTime + START_DELAY_SECONDS;
    this.startAmbience(setup.ambience);
    this.advance();
  }

  getSnapshot(): PerformanceSnapshot {
    const now = this.audio.currentTime;
    const playingPosition = this.cues.findLastIndex((cue) => cue.startTime !== null && cue.startTime <= now);
    const playingCue = this.cues[playingPosition];
    const secondsIntoCue = playingCue && playingCue.startTime !== null ? now - playingCue.startTime : 0;
    const lastEndTime = this.cues.at(-1)?.endTime ?? Infinity;
    return {
      statuses: this.cues.map((cue, position) => this.getStatus(cue, position, playingPosition, now)),
      playingPosition,
      spokenWordCount: this.getWordStarts(playingPosition).filter((start) => start <= secondsIntoCue).length,
      hasFinished: this.schedulingPosition >= this.lines.length && now >= lastEndTime,
    };
  }

  fadeOutAmbience() {
    const now = this.audio.currentTime;
    this.ambienceVolume?.gain.setValueAtTime(AMBIENCE_VOLUME, now);
    this.ambienceVolume?.gain.linearRampToValueAtTime(0, now + AMBIENCE_FADE_SECONDS);
  }

  stop() {
    this.stopWaiting?.();
    this.sources.forEach((source) => source.stop());
  }

  private startAmbience(ambience: AmbienceName | undefined) {
    const buffer = ambience ? this.job.getSound(ambience) : undefined;
    if (!buffer) {
      return;
    }
    const volume = this.audio.createGain();
    volume.gain.value = AMBIENCE_VOLUME;
    volume.connect(this.audio.destination);
    const source = this.playBuffer(buffer, this.nextStartTime, volume);
    source.loop = true;
    this.ambienceVolume = volume;
  }

  private advance = () => {
    this.stopWaiting?.();
    this.stopWaiting = null;
    while (this.schedulingPosition < this.lines.length) {
      const buffer = this.findBuffer(this.schedulingPosition);
      if (buffer === undefined) {
        this.stopWaiting = this.job.subscribe(this.advance);
        return;
      }
      this.schedule(this.schedulingPosition, buffer);
      this.schedulingPosition += 1;
      const nextLine = this.lines[this.schedulingPosition];
      this.nextStartTime += nextLine?.startsParagraph ? PARAGRAPH_GAP_SECONDS : LINE_GAP_SECONDS;
    }
  };

  private findBuffer(position: number): AudioBuffer | null | undefined {
    const line = this.lines[position];
    if (!line) {
      return null;
    }
    if (line.kind === "speech") {
      return this.job.getLine(line.key)?.buffer;
    }
    const sound = this.job.getSound(line.sound);
    return sound ?? (this.job.getProgress().status === "voicing" ? undefined : null);
  }

  private schedule(position: number, buffer: AudioBuffer | null) {
    const cue = this.cues[position];
    if (!cue) {
      return;
    }
    const startAt = Math.max(this.nextStartTime, this.audio.currentTime + 0.05);
    if (buffer) {
      this.playBuffer(buffer, startAt, this.audio.destination);
    }
    cue.startTime = startAt;
    cue.endTime = startAt + (buffer ? buffer.duration : 0);
    this.nextStartTime = cue.endTime;
  }

  private playBuffer(buffer: AudioBuffer, startAt: number, output: AudioNode) {
    const source = this.audio.createBufferSource();
    source.buffer = buffer;
    source.connect(output);
    source.start(startAt);
    this.sources.push(source);
    return source;
  }

  private getWordStarts(position: number) {
    const line = this.lines[position];
    return line?.kind === "speech" ? (this.job.getLine(line.key)?.wordStarts ?? []) : [];
  }

  private getStatus(cue: CueTiming, position: number, playingPosition: number, now: number): CueStatus {
    if (cue.endTime !== null && now >= cue.endTime) {
      return "played";
    }
    if (position === playingPosition) {
      return "playing";
    }
    return this.findBuffer(position) === undefined ? "rendering" : "ready";
  }
}

type CueTiming = {
  startTime: number | null;
  endTime: number | null;
};

function waitingCue(): CueTiming {
  return { startTime: null, endTime: null };
}

function playedCue(): CueTiming {
  return { startTime: -1, endTime: -1 };
}
