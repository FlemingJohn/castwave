import { useEffect, useRef } from "react";
import type { SpeakerWaveProps } from "./SpeakerWaveProps";
import styles from "./SpeakerWave.module.css";

const BAR_SPACING = 6;
const HISTORY_LENGTH = 400;
const SMOOTHING = 0.35;

export function SpeakerWave(props: SpeakerWaveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const readLevelRef = useRef(props.readLevel);
  readLevelRef.current = props.readLevel;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }
    const levels: number[] = [];
    let level = 0;
    let frame = 0;
    const draw = () => {
      level += (readLevelRef.current() - level) * SMOOTHING;
      levels.push(level);
      if (levels.length > HISTORY_LENGTH) {
        levels.shift();
      }
      drawBars(context, canvas, levels);
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvasRef} className={styles.wave} data-colour={props.colourNumber} aria-hidden="true" />;
}

function drawBars(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, levels: number[]) {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(canvas.clientWidth * ratio);
  canvas.height = Math.round(canvas.clientHeight * ratio);
  const { width, height } = canvas;
  const count = Math.max(8, Math.floor(width / (BAR_SPACING * ratio)));
  const step = width / count;
  context.clearRect(0, 0, width, height);
  context.fillStyle = getComputedStyle(canvas).color;
  for (let index = 0; index < count; index += 1) {
    const value = levels[levels.length - count + index] ?? 0;
    const barHeight = Math.max(2 * ratio, value * height * 0.92);
    context.globalAlpha = 0.3 + 0.7 * (index / count);
    context.fillRect(index * step, (height - barHeight) / 2, Math.max(ratio * 1.5, step * 0.55), barHeight);
  }
  context.globalAlpha = 1;
}
