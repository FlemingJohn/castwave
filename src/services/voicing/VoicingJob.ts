import { getVoiceTokensAction } from "@/server/actions/voices/getVoiceTokensAction";
import { loadShowcaseLines } from "@/services/showcase/loadShowcaseLines";
import { loadSounds } from "@/services/sounds/loadSounds";
import { joinPcmChunks } from "@/services/speech/joinPcmChunks";
import { openSpeechStream } from "@/services/speech/openSpeechStream";
import { SPEECH_SAMPLE_RATE } from "@/services/speech/speechSampleRate";
import type { AmbienceName } from "@/types/AmbienceName";
import type { Script } from "@/types/Script";
import type { SoundName } from "@/types/SoundName";
import type { SpeechStreamEvent } from "@/types/SpeechStreamEvent";
import type { VoicedLine } from "@/types/VoicedLine";
import type { VoiceName } from "@/types/VoiceName";
import type { VoicingProgress } from "@/types/VoicingProgress";

const MAX_SESSIONS = 4;
const TOKENS_PER_REQUEST = 8;

export class VoicingJob {
  readonly scriptId: string;
  private tasks: SpeechTask[];
  private progress: VoicingProgress;
  private readonly voiced = new Map<string, VoicedLine>();
  private readonly sounds = new Map<SoundName | AmbienceName, AudioBuffer>();
  private readonly listeners = new Set<() => void>();
  private readonly sockets = new Set<WebSocket>();
  private wantsAutoplay = false;

  constructor(script: Script) {
    this.scriptId = script.id;
    this.tasks = collectTasks(script);
    this.progress = this.measure("voicing", "");
    void this.voiceEverything(script);
  }

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getProgress = () => this.progress;

  getLine(key: string) {
    return this.voiced.get(key);
  }

  getSound(name: SoundName | AmbienceName) {
    return this.sounds.get(name);
  }

  isSceneReady(sceneId: string) {
    return this.tasks.filter((task) => task.sceneId === sceneId).every((task) => this.voiced.has(task.key));
  }

  requestAutoplay() {
    this.wantsAutoplay = true;
  }

  hasAutoplayRequest() {
    return this.wantsAutoplay;
  }

  takeAutoplay() {
    const wanted = this.wantsAutoplay;
    this.wantsAutoplay = false;
    return wanted;
  }

  async revoice(script: Script, characterName: string) {
    this.tasks = collectTasks(script);
    const redo = this.tasks.filter((task) => task.speaker === characterName);
    redo.forEach((task) => this.voiced.delete(task.key));
    this.update("voicing");
    await this.runSafely(() => this.voiceTasks(redo));
  }

  stop() {
    this.sockets.forEach((socket) => socket.close());
    this.sockets.clear();
  }

  private async voiceEverything(script: Script) {
    const voicing = script.showcase ? this.loadShowcase(script.showcase) : this.voiceTasks(this.tasks);
    await this.runSafely(() => Promise.all([this.loadAllSounds(script), voicing]));
  }

  private async loadShowcase(slug: string) {
    await loadShowcaseLines(slug, (key, line) => {
      this.voiced.set(key, line);
      this.update("voicing");
    });
  }

  private async runSafely(work: () => Promise<unknown>) {
    try {
      await work();
      this.update(this.tasks.every((task) => this.voiced.has(task.key)) ? "ready" : "voicing");
    } catch (error) {
      this.update("failed", error instanceof Error ? error.message : "Voicing stopped unexpectedly.");
    }
  }

  private async loadAllSounds(script: Script) {
    const names = new Set<SoundName | AmbienceName>(script.ambience ? [script.ambience] : []);
    script.scenes.forEach((scene) => scene.cues.forEach((cue) => cue.kind === "sound" && names.add(cue.sound)));
    const loaded = await loadSounds(new OfflineAudioContext(1, 1, SPEECH_SAMPLE_RATE), [...names]);
    loaded.forEach((buffer, name) => this.sounds.set(name, buffer));
  }

  private async voiceTasks(tasks: SpeechTask[]) {
    const groups = new Map<VoiceName, SpeechTask[]>();
    tasks.forEach((task) => groups.set(task.voice, [...(groups.get(task.voice) ?? []), task]));
    const tokens = await getTokens(groups.size);
    const queue = [...groups].map(([voice, list], position) => ({ voice, list, token: tokens[position] ?? "" }));
    const voiceNextGroup = async () => {
      for (let next = queue.shift(); next; next = queue.shift()) {
        await this.voiceGroup(next.voice, next.token, next.list);
      }
    };
    await Promise.all(Array.from({ length: Math.min(MAX_SESSIONS, queue.length) }, voiceNextGroup));
  }

  private voiceGroup(voice: VoiceName, token: string, list: SpeechTask[]) {
    return new Promise<void>((resolve, reject) => {
      const chunks: string[] = [];
      let receiving = 0;
      const handleEvent = (event: SpeechStreamEvent, socket: WebSocket) => {
        if (event.type === "Begin") {
          list.forEach((task) => {
            socket.send(JSON.stringify({ type: "Generate", text: task.text }));
            socket.send(JSON.stringify({ type: "Flush" }));
          });
        } else if (event.type === "Audio") {
          chunks.push(event.audio);
        } else if (event.type === "FlushDone") {
          receiving = this.finishLine(list[receiving], chunks, receiving);
          if (receiving === list.length) {
            socket.send(JSON.stringify({ type: "Terminate" }));
            resolve();
          }
        } else if (event.type === "WordBoundaries") {
          this.setWordStarts(list[event.flush_id], event.words, event.audio_start_ms);
        } else if (event.type === "Termination") {
          socket.close();
          this.sockets.delete(socket);
        } else if (event.type === "Error") {
          reject(new Error(event.error));
        }
      };
      this.sockets.add(openSpeechStream(token, voice, handleEvent));
    });
  }

  private finishLine(task: SpeechTask | undefined, chunks: string[], receiving: number) {
    if (task) {
      this.voiced.set(task.key, {
        buffer: joinPcmChunks(chunks.splice(0)),
        wordStarts: [],
      });
      this.update("voicing");
    }
    return receiving + 1;
  }

  private setWordStarts(task: SpeechTask | undefined, words: { start: number }[], audioStartMilliseconds: number) {
    const line = task ? this.voiced.get(task.key) : undefined;
    if (line) {
      line.wordStarts = words.map((word) => (word.start - audioStartMilliseconds) / 1000);
    }
  }

  private update(status: VoicingProgress["status"], errorMessage = "") {
    this.progress = this.measure(status, errorMessage);
    [...this.listeners].forEach((listener) => listener());
  }

  private measure(status: VoicingProgress["status"], errorMessage: string): VoicingProgress {
    const isDone = (task: SpeechTask) => this.voiced.has(task.key);
    const countBy = (field: "speaker" | "sceneId") =>
      [...new Set(this.tasks.map((task) => task[field]))].map((value) => {
        const matching = this.tasks.filter((task) => task[field] === value);
        return {
          value,
          done: matching.filter(isDone).length,
          total: matching.length,
        };
      });
    return {
      status,
      errorMessage,
      linesDone: this.tasks.filter(isDone).length,
      linesTotal: this.tasks.length,
      audioSeconds: [...this.voiced.values()].reduce((total, line) => total + line.buffer.duration, 0),
      characters: countBy("speaker").map(({ value, done, total }) => ({
        name: value,
        done,
        total,
      })),
      scenes: countBy("sceneId").map(({ value, done, total }) => ({
        id: value,
        done,
        total,
      })),
    };
  }
}

type SpeechTask = {
  key: string;
  sceneId: string;
  speaker: string;
  voice: VoiceName;
  text: string;
};

function collectTasks(script: Script): SpeechTask[] {
  return script.scenes.flatMap((scene) =>
    scene.cues.flatMap((cue, index) => {
      if (cue.kind !== "speech") {
        return [];
      }
      const character = script.cast.find((member) => member.name === cue.speaker);
      const voice = character ? character.voice : "george";
      return [
        {
          key: `${scene.id}/${index}`,
          sceneId: scene.id,
          speaker: cue.speaker,
          voice,
          text: cue.text,
        },
      ];
    }),
  );
}

async function getTokens(count: number) {
  const batches: number[] = [];
  for (let remaining = count; remaining > 0; remaining -= TOKENS_PER_REQUEST) {
    batches.push(Math.min(TOKENS_PER_REQUEST, remaining));
  }
  const results = await Promise.all(batches.map((size) => getVoiceTokensAction(size)));
  return results.flat();
}
