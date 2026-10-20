import type { PreparingStepProps } from "@/components/preparing/PreparingStep/PreparingStepProps";
import type { PicturesProgress } from "@/types/PicturesProgress";
import type { Script } from "@/types/Script";
import type { VoicingProgress } from "@/types/VoicingProgress";

type Step = Omit<PreparingStepProps, "children">;

export function getPreparingSteps(
  script: Script | null,
  progress: VoicingProgress | null,
  pictures: PicturesProgress | null,
): Step[] {
  const steps = getVoiceSteps(script, progress);
  if (!script || !pictures || pictures.status === "off") {
    return steps;
  }
  const detail =
    pictures.status === "done" && pictures.failed > 0
      ? `${pictures.done} of ${pictures.total} pictures. The rest use the plain backdrop.`
      : "Pollinations paints one picture for every scene.";
  const picturesStep: Step = {
    icon: "image",
    title: "Painting the scenes",
    detail,
    state: pictures.status === "done" ? "done" : "active",
  };
  return [...steps.slice(0, 3), picturesStep, ...steps.slice(3)];
}

function getVoiceSteps(script: Script | null, progress: VoicingProgress | null): Step[] {
  const isReady = progress?.status === "ready";
  if (!script) {
    return [
      {
        icon: "pen",
        title: "Writing the script",
        detail: "LLM Gateway is writing every scene and every line.",
        state: "active",
      },
      {
        icon: "cast",
        title: "Casting the voices",
        detail: "A voice for every character.",
        state: "waiting",
      },
      {
        icon: "wave",
        title: "Voicing every line",
        detail: "One streaming connection per voice.",
        state: "waiting",
      },
      {
        icon: "ready",
        title: "Ready",
        detail: "Play, choices and replays start instantly.",
        state: "waiting",
      },
    ];
  }
  const lineCount = script.scenes.reduce((total, scene) => total + scene.cues.length, 0);
  const sceneWord = script.scenes.length === 1 ? "scene" : "scenes";
  return [
    {
      icon: "pen",
      title: "Writing the script",
      detail: `${script.scenes.length} ${sceneWord}, ${lineCount} cues.`,
      state: "done",
    },
    {
      icon: "cast",
      title: "Casting the voices",
      detail: `${script.cast.length} voices chosen.`,
      state: "done",
    },
    {
      icon: "wave",
      title: "Voicing every line",
      detail: isReady ? "Every line is voiced." : "AssemblyAI streaming text-to-speech, all characters at once.",
      state: isReady ? "done" : "active",
    },
    {
      icon: "ready",
      title: "Ready",
      detail: "Play, choices and replays start instantly.",
      state: isReady ? "done" : "waiting",
    },
  ];
}
