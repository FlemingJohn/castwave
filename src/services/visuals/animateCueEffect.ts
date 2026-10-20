import type { CueEffect } from "@/types/CueEffect";

const DURATION_BY_EFFECT: Record<CueEffect, number> = {
  thunder: 760,
  door_slam: 420,
  heartbeat: 3600,
};

export function animateCueEffect(element: HTMLElement, effect: CueEffect) {
  const isStill = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const started = performance.now();
  let frame = 0;
  const step = (now: number) => {
    const age = now - started;
    if (age > DURATION_BY_EFFECT[effect]) {
      element.style.filter = "";
      element.style.transform = "";
      return;
    }
    const look = LOOK_BY_EFFECT[effect](age, isStill);
    element.style.filter = look.filter;
    element.style.transform = look.transform;
    frame = requestAnimationFrame(step);
  };
  frame = requestAnimationFrame(step);
  return () => {
    cancelAnimationFrame(frame);
    element.style.filter = "";
    element.style.transform = "";
  };
}

const LOOK_BY_EFFECT: Record<CueEffect, (age: number, isStill: boolean) => { filter: string; transform: string }> = {
  thunder: (age) => {
    const first = Math.max(0, 1 - age / 140);
    const second = age > 220 ? Math.max(0, 1 - (age - 220) / 520) * 0.85 : 0;
    const strength = Math.max(first, second);
    return {
      filter: `brightness(${1 + strength * 1.5}) contrast(${1 + strength * 0.15}) saturate(${1 - strength * 0.45})`,
      transform: "",
    };
  },
  door_slam: (age, isStill) => {
    const strength = Math.max(0, 1 - age / 420);
    const offset = isStill ? 0 : Math.sin(age * 0.09) * 10 * strength;
    return { filter: `brightness(${1 + strength * 0.2})`, transform: `translate(${offset}px, ${offset * 0.4}px)` };
  },
  heartbeat: (age, isStill) => {
    const beat = (age % 900) / 900;
    const first = beat < 0.12 ? Math.sin((beat / 0.12) * Math.PI) : 0;
    const second = beat > 0.22 && beat < 0.34 ? 0.6 * Math.sin(((beat - 0.22) / 0.12) * Math.PI) : 0;
    const pulse = first + second;
    return { filter: `brightness(${1 - pulse * 0.14})`, transform: isStill ? "" : `scale(${1 + pulse * 0.025})` };
  },
};
