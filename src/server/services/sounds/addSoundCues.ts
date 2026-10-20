import "server-only";
import type { Cue } from "@/types/Cue";
import type { DraftLine } from "@/types/DraftLine";
import type { SoundName } from "@/types/SoundName";

export function addSoundCues(lines: DraftLine[]): Cue[] {
  const cues: Cue[] = [];
  let previousSound: SoundName | undefined;
  for (const line of lines) {
    const rule = line.speaker === "Narrator" ? SOUND_RULES.find((candidate) => candidate.pattern.test(line.text)) : undefined;
    if (rule && rule.sound !== previousSound) {
      cues.push({ kind: "sound", sound: rule.sound, description: rule.description, startsParagraph: line.startsParagraph });
      previousSound = rule.sound;
    }
    cues.push({ kind: "speech", speaker: line.speaker, text: line.text, startsParagraph: rule ? false : line.startsParagraph });
  }
  return cues;
}

const SOUND_RULES: { pattern: RegExp; sound: SoundName; description: string }[] = [
  { pattern: /\bknock(s|ed|ing)?\b/i, sound: "door_knock", description: "A knock at the door" },
  { pattern: /\bslam(s|med|ming)?\b/i, sound: "door_slam", description: "A door slams" },
  { pattern: /\bcreak(s|ed|ing)?\b|\bdoor\b[^.]*\b(open(s|ed)?|swung|burst)\b/i, sound: "door_creak", description: "A door creaks open" },
  { pattern: /\bdoor\b[^.]*\b(clos(es|ed)|shut)\b/i, sound: "door_close", description: "A door closes" },
  { pattern: /\b(shatter(s|ed)?|smash(es|ed)?)\b|\bglass\b[^.]*\bbr(eak|oke)\b/i, sound: "glass_break", description: "Glass shatters" },
  { pattern: /\bscream(s|ed|ing)?\b/i, sound: "scream", description: "A scream" },
  { pattern: /\b(thunder|lightning)\b/i, sound: "thunder", description: "Thunder rolls" },
  { pattern: /\bheart(beat)?\b[^.]*\b(pound|race|thump|beat)/i, sound: "heartbeat", description: "A pounding heartbeat" },
  { pattern: /\bclock\b/i, sound: "clock_ticking", description: "A clock ticks" },
  { pattern: /\b(footsteps?|stairs|staircase)\b/i, sound: "footsteps", description: "Footsteps" },
];
