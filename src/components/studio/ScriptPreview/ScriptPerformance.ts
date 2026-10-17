import { openSpeechStream } from "@/services/speech/openSpeechStream";
import { toAudioBuffer } from "@/services/speech/toAudioBuffer";
import type { CueStatus } from "@/types/CueStatus";
import type { SpeechStreamEvent } from "@/types/SpeechStreamEvent";
import type { VoiceName } from "@/types/VoiceName";
import type { PerformanceLine } from "./PerformanceLine";
import type { PerformanceSnapshot } from "./PerformanceSnapshot";

const LINES_AHEAD = 5;
const LINE_GAP_SECONDS = 0.16;
const PARAGRAPH_GAP_SECONDS = 0.45;
const START_DELAY_SECONDS = 0.1;

export class ScriptPerformance {
  private readonly audio: AudioContext;
  private readonly lines: PerformanceLine[];
  private readonly onFailure: (message: string) => void;
  private readonly cues: CueAudio[];
  private readonly connections = new Map<VoiceName, Connection>();
  private readonly sources: AudioBufferSourceNode[] = [];
  private schedulingPosition: number;
  private nextStartTime: number;

  constructor(
    audio: AudioContext,
    lines: PerformanceLine[],
    tokenByVoice: Map<VoiceName, string>,
    firstPosition: number,
    onFailure: (message: string) => void,
  ) {
    this.audio = audio;
    this.lines = lines;
    this.onFailure = onFailure;
    this.cues = lines.map(makeCueAudio);
    this.schedulingPosition = firstPosition;
    this.nextStartTime = audio.currentTime + START_DELAY_SECONDS;
    for (const [voice, token] of tokenByVoice) {
      this.openConnection(voice, token, firstPosition);
    }
    this.requestUpcomingCues();
  }

  getSnapshot(): PerformanceSnapshot {
    const now = this.audio.currentTime;
    let playingPosition = -1;
    this.cues.forEach((cue, position) => {
      if (cue.startTime !== null && cue.startTime <= now) {
        playingPosition = position;
      }
    });
    const playingCue = this.cues[playingPosition];
    const secondsIntoCue = playingCue && playingCue.startTime !== null ? now - playingCue.startTime : 0;
    const lastCue = this.cues[this.cues.length - 1];
    const lastEndTime = lastCue && lastCue.endTime !== null ? lastCue.endTime : Infinity;
    return {
      statuses: this.cues.map((cue, position) => getStatus(cue, position, playingPosition, now)),
      playingPosition,
      spokenWordCount: playingCue ? playingCue.wordStarts.filter((start) => start <= secondsIntoCue).length : 0,
      hasFinished: this.schedulingPosition >= this.lines.length && now >= lastEndTime,
    };
  }

  stop() {
    this.sources.forEach((source) => source.stop());
    this.connections.forEach((connection) => connection.socket.close());
  }

  private openConnection(voice: VoiceName, token: string, firstPosition: number) {
    const remainingCount = this.lines.filter((line, position) => position >= firstPosition && line.voice === voice).length;
    if (remainingCount === 0) {
      return;
    }
    const socket = openSpeechStream(token, voice, (event) => this.handleEvent(voice, event));
    this.connections.set(voice, { socket, isOpen: false, waitingPositions: [], sentPositions: [], receivingIndex: 0, remainingCount });
  }

  private requestUpcomingCues() {
    const lastPosition = Math.min(this.lines.length - 1, this.schedulingPosition + LINES_AHEAD);
    for (let position = this.schedulingPosition; position <= lastPosition; position++) {
      const cue = this.cues[position];
      const line = this.lines[position];
      const connection = line ? this.connections.get(line.voice) : undefined;
      if (!cue || !connection || cue.isRequested) {
        continue;
      }
      cue.isRequested = true;
      if (connection.isOpen) {
        this.send(connection, position);
      } else {
        connection.waitingPositions.push(position);
      }
    }
  }

  private send(connection: Connection, position: number) {
    const line = this.lines[position];
    if (!line) {
      return;
    }
    connection.socket.send(JSON.stringify({ type: "Generate", text: line.text }));
    connection.socket.send(JSON.stringify({ type: "Flush" }));
    connection.sentPositions.push(position);
  }

  private handleEvent(voice: VoiceName, event: SpeechStreamEvent) {
    const connection = this.connections.get(voice);
    if (!connection) {
      return;
    }
    const receivingPosition = connection.sentPositions[connection.receivingIndex];
    switch (event.type) {
      case "Begin":
        connection.isOpen = true;
        connection.waitingPositions.forEach((position) => this.send(connection, position));
        connection.waitingPositions = [];
        return;
      case "Audio":
        if (receivingPosition !== undefined) {
          this.addBuffer(receivingPosition, toAudioBuffer(this.audio, event.audio));
        }
        return;
      case "FlushDone":
        this.finishReceiving(connection, receivingPosition);
        return;
      case "WordBoundaries":
        this.setWordStarts(connection.sentPositions[event.flush_id], event.words, event.audio_start_ms);
        return;
      case "Termination":
        connection.socket.close();
        return;
      case "Error":
        this.onFailure(event.error);
    }
  }

  private finishReceiving(connection: Connection, position: number | undefined) {
    connection.receivingIndex += 1;
    connection.remainingCount -= 1;
    if (connection.remainingCount === 0) {
      connection.socket.send(JSON.stringify({ type: "Terminate" }));
    }
    const cue = position === undefined ? undefined : this.cues[position];
    if (!cue) {
      return;
    }
    cue.isComplete = true;
    if (position === this.schedulingPosition) {
      this.advance();
    }
  }

  private setWordStarts(position: number | undefined, words: { start: number }[], audioStartMilliseconds: number) {
    const cue = position === undefined ? undefined : this.cues[position];
    if (cue) {
      cue.wordStarts = words.map((word) => (word.start - audioStartMilliseconds) / 1000);
    }
  }

  private addBuffer(position: number, buffer: AudioBuffer) {
    this.cues[position]?.buffers.push(buffer);
    if (position === this.schedulingPosition) {
      this.scheduleBuffers(position);
    }
  }

  private scheduleBuffers(position: number) {
    const cue = this.cues[position];
    while (cue && cue.scheduledCount < cue.buffers.length) {
      const buffer = cue.buffers[cue.scheduledCount];
      const startAt = Math.max(this.nextStartTime, this.audio.currentTime + 0.05);
      const source = this.audio.createBufferSource();
      source.buffer = buffer ?? null;
      source.connect(this.audio.destination);
      source.start(startAt);
      this.sources.push(source);
      cue.startTime = cue.startTime ?? startAt;
      this.nextStartTime = startAt + (buffer ? buffer.duration : 0);
      cue.scheduledCount += 1;
    }
  }

  private advance() {
    let cue = this.cues[this.schedulingPosition];
    while (cue && cue.isComplete && cue.scheduledCount === cue.buffers.length) {
      cue.startTime = cue.startTime ?? this.nextStartTime;
      cue.endTime = this.nextStartTime;
      this.schedulingPosition += 1;
      const nextLine = this.lines[this.schedulingPosition];
      if (!nextLine) {
        return;
      }
      this.nextStartTime += nextLine.startsParagraph ? PARAGRAPH_GAP_SECONDS : LINE_GAP_SECONDS;
      this.scheduleBuffers(this.schedulingPosition);
      this.requestUpcomingCues();
      cue = this.cues[this.schedulingPosition];
    }
  }
}

type CueAudio = {
  buffers: AudioBuffer[];
  scheduledCount: number;
  isRequested: boolean;
  isComplete: boolean;
  startTime: number | null;
  endTime: number | null;
  wordStarts: number[];
};

type Connection = {
  socket: WebSocket;
  isOpen: boolean;
  waitingPositions: number[];
  sentPositions: number[];
  receivingIndex: number;
  remainingCount: number;
};

function makeCueAudio(): CueAudio {
  return { buffers: [], scheduledCount: 0, isRequested: false, isComplete: false, startTime: null, endTime: null, wordStarts: [] };
}

function getStatus(cue: CueAudio, position: number, playingPosition: number, now: number): CueStatus {
  if (cue.endTime !== null && now >= cue.endTime) {
    return "played";
  }
  if (position === playingPosition) {
    return "playing";
  }
  if (cue.isComplete) {
    return "ready";
  }
  return cue.isRequested ? "rendering" : "waiting";
}
