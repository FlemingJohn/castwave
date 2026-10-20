import { useEffect, useRef } from "react";
import styles from "./RainLayer.module.css";

const NEAR_DROPS = 90;
const FAR_DROPS = 160;

type Drop = { x: number; y: number; speed: number; length: number; isNear: boolean };

export function RainLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) {
      return;
    }
    const isStill = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const drops = [...makeDrops(NEAR_DROPS, true), ...makeDrops(FAR_DROPS, false)];
    let frame = 0;
    const draw = () => {
      fitCanvas(canvas);
      drawRain(context, canvas, drops, isStill);
      frame = isStill ? 0 : requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  return <canvas ref={canvasRef} className={styles.rain} aria-hidden="true" />;
}

function makeDrops(count: number, isNear: boolean): Drop[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 1.2,
    y: Math.random(),
    speed: (isNear ? 0.022 : 0.012) * (0.8 + Math.random() * 0.4),
    length: (isNear ? 0.07 : 0.035) * (0.7 + Math.random() * 0.6),
    isNear,
  }));
}

function fitCanvas(canvas: HTMLCanvasElement) {
  const ratio = window.devicePixelRatio || 1;
  const width = Math.round(canvas.clientWidth * ratio);
  const height = Math.round(canvas.clientHeight * ratio);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function drawRain(context: CanvasRenderingContext2D, canvas: HTMLCanvasElement, drops: Drop[], isStill: boolean) {
  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);
  context.strokeStyle = getComputedStyle(canvas).color;
  context.lineCap = "round";
  for (const isNear of [false, true]) {
    context.globalAlpha = isNear ? 0.38 : 0.2;
    context.lineWidth = Math.max(1, (isNear ? 1.6 : 1) * (window.devicePixelRatio || 1));
    context.beginPath();
    for (const drop of drops.filter((candidate) => candidate.isNear === isNear)) {
      moveDrop(drop, isStill);
      const x = drop.x * width;
      const y = drop.y * height;
      context.moveTo(x, y);
      context.lineTo(x - drop.length * height * 0.25, y + drop.length * height);
    }
    context.stroke();
  }
  context.globalAlpha = 1;
}

function moveDrop(drop: Drop, isStill: boolean) {
  if (isStill) {
    return;
  }
  drop.y += drop.speed;
  drop.x -= drop.speed * 0.25;
  if (drop.y > 1.05) {
    drop.y = -0.1;
    drop.x = Math.random() * 1.2;
  }
}
