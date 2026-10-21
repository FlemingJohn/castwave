const STAGE_WIDTH = 1920;
const STAGE_HEIGHT = 1080;
const CAMERA_TIME = 1150;
const FADE_TIME = 380;
const DUCKED_LEVEL = 0.18;
const PHRASE_CHARACTERS = 44;
const IDEA = "A night guard at an old wax museum hears the figures whisper his name.";

const stage = document.getElementById("stage");
const world = document.getElementById("world");
const frame = document.getElementById("app");
const spotlight = document.getElementById("spotlight");
const cursor = document.getElementById("cursor");
const ripple = document.getElementById("ripple");
const caption = document.getElementById("caption");
const captionLine = document.getElementById("caption-line");
const live = document.getElementById("live");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const app = () => frame.contentDocument;
const find = (selector) => app().querySelector(selector);
const findByText = (selector, text) => [...app().querySelectorAll(selector)].find((node) => node.textContent.includes(text));
const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const progress = (t, start, end) => ease(clamp((t - start) / (end - start)));
const lerp = (a, b, p) => a + (b - a) * p;

function fitStage() {
  const fit = Math.min(window.innerWidth / STAGE_WIDTH, window.innerHeight / STAGE_HEIGHT);
  stage.style.setProperty("--fit", String(fit));
}

async function waitFor(check, timeout = 180000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    const found = check();
    if (found) {
      return found;
    }
    await wait(200);
  }
  throw new Error("The demo waited too long for the app.");
}

const sound = {
  mix: null,
  record: null,
  narration: null,
  voices: null,
  app: null,
  start() {
    if (this.mix) {
      return;
    }
    this.mix = new AudioContext();
    const master = this.mix.createGain();
    this.record = this.mix.createMediaStreamDestination();
    master.connect(this.mix.destination);
    master.connect(this.record);
    this.narration = this.mix.createGain();
    this.voices = this.mix.createGain();
    this.app = this.mix.createGain();
    [this.narration, this.voices, this.app].forEach((channel) => channel.connect(master));
  },
  duck(isDucked) {
    const now = this.mix.currentTime;
    this.app.gain.cancelScheduledValues(now);
    this.app.gain.setValueAtTime(this.app.gain.value, now);
    this.app.gain.linearRampToValueAtTime(isDucked ? DUCKED_LEVEL : 1, now + (isDucked ? 0.35 : 0.8));
  },
  play(url, channel) {
    const player = new Audio(url);
    this.mix.createMediaElementSource(player).connect(channel);
    const ended = new Promise((resolve) => {
      player.addEventListener("ended", resolve, { once: true });
      player.addEventListener("error", resolve, { once: true });
    });
    void player.play();
    return { player, ended };
  },
  tapApp(appWindow) {
    if (appWindow.castwaveTapped) {
      return;
    }
    appWindow.castwaveTapped = true;
    const taps = new WeakMap();
    const connect = appWindow.AudioNode.prototype.connect;
    const director = this;
    appWindow.AudioNode.prototype.connect = function (target, ...rest) {
      const result = connect.call(this, target, ...rest);
      if (target instanceof appWindow.AudioDestinationNode && director.mix) {
        let tap = taps.get(this.context);
        if (!tap) {
          tap = this.context.createMediaStreamDestination();
          taps.set(this.context, tap);
          director.mix.createMediaStreamSource(tap.stream).connect(director.app);
        }
        connect.call(this, tap);
      }
      return result;
    };
  },
};

let captions = {};
let speaking = 0;

function toPhrases(words) {
  const phrases = [];
  let current = [];
  let length = 0;
  for (const word of words) {
    if (current.length && length + word.text.length + 1 > PHRASE_CHARACTERS) {
      phrases.push(current);
      current = [];
      length = 0;
    }
    current.push(word);
    length += word.text.length + 1;
    if (/[.,;:?!]$/.test(word.text) && length > PHRASE_CHARACTERS / 2) {
      phrases.push(current);
      current = [];
      length = 0;
    }
  }
  if (current.length) {
    phrases.push(current);
  }
  return phrases;
}

async function speak(name) {
  const clip = captions[name];
  const turn = ++speaking;
  sound.duck(true);
  const { player, ended } = sound.play(`/demo/narration/${name}.mp3`, sound.narration);
  const phrases = clip ? toPhrases(clip.words) : [];
  let shown = -1;
  let isDone = false;
  const draw = () => {
    if (isDone || turn !== speaking) {
      return;
    }
    const t = player.currentTime;
    const index = Math.max(0, phrases.findLastIndex((phrase) => t >= phrase[0].start - 0.15));
    const phrase = phrases[index];
    if (phrase && index !== shown) {
      shown = index;
      captionLine.innerHTML = phrase.map((word) => `<span>${word.text}</span>`).join(" ");
      captionLine.classList.remove("enter");
      void captionLine.offsetWidth;
      captionLine.classList.add("enter");
      caption.hidden = false;
    }
    if (phrase) {
      [...captionLine.children].forEach((node, i) => {
        node.className = t >= phrase[i].end ? "said" : t >= phrase[i].start - 0.05 ? "now" : "";
      });
    }
    requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);
  await ended;
  isDone = true;
  if (turn === speaking) {
    [...captionLine.children].forEach((node) => (node.className = "said"));
    sound.duck(false);
    setTimeout(() => {
      if (turn === speaking) {
        caption.hidden = true;
      }
    }, 450);
  }
}

function clipLength(name) {
  return captions[name]?.duration ?? 3;
}

function setScene(name) {
  stage.dataset.scene = name;
}

const INTRO_LINES = [
  { who: 0, url: "/showcase/knocking-light/lines/opening-1.mp3", text: "The storm rages outside while you hear rhythmic knocking from the locked lamp room." },
  { who: 1, url: "/showcase/knocking-light/lines/opening-2.mp3", text: "“Never open that door. The lamp room is sealed for a reason.”" },
  { who: 2, url: "/showcase/knocking-light/lines/a-4.mp3", text: "“I am not here to harm you, keeper.”" },
];
const INTRO_TEXT = [
  [INTRO_LINES[0].text, 0],
  ["Old Tom warns:", null],
  [INTRO_LINES[1].text, 1],
  ["A stranger answers:", null],
  [INTRO_LINES[2].text, 2],
];
const SPEAKERS = [
  { name: "Narrator", initial: "N", colour: "var(--haze)" },
  { name: "Old Tom", initial: "T", colour: "var(--mint)" },
  { name: "The Stranger", initial: "S", colour: "var(--rose)" },
];

const intro = {
  words: [],
  waves: [],
  build() {
    const para = document.getElementById("para");
    const bubbles = document.getElementById("bubbles");
    const flyers = document.getElementById("flyers");
    SPEAKERS.forEach((speaker) => {
      const bubble = document.createElement("div");
      bubble.className = "bubble";
      bubble.style.setProperty("--c", speaker.colour);
      bubble.innerHTML = `<div class="who"><span class="avatar">${speaker.initial}</span>${speaker.name}</div><div class="said"></div><div class="wave"></div>`;
      const wave = bubble.querySelector(".wave");
      for (let i = 0; i < 36; i += 1) {
        wave.append(document.createElement("i"));
      }
      bubbles.append(bubble);
      speaker.bubble = bubble;
      speaker.said = bubble.querySelector(".said");
      this.waves.push([...wave.children]);
    });
    INTRO_TEXT.forEach(([sentence, who]) => {
      sentence.split(" ").forEach((text) => {
        const ghost = document.createElement("span");
        ghost.textContent = `${text} `;
        para.append(ghost);
        const item = { text, who, ghost };
        if (who !== null) {
          item.target = document.createElement("span");
          item.target.textContent = `${text} `;
          SPEAKERS[who].said.append(item.target);
        }
        item.fly = document.createElement("span");
        item.fly.className = "fly";
        item.fly.textContent = text;
        flyers.append(item.fly);
        this.words.push(item);
      });
    });
    "Castwave".split("").forEach((letter) => {
      const span = document.createElement("span");
      span.textContent = letter;
      document.getElementById("word").append(span);
    });
  },
  measure() {
    const base = stage.getBoundingClientRect();
    const scale = base.width / STAGE_WIDTH;
    const place = (element) => {
      const box = element.getBoundingClientRect();
      return { x: (box.left - base.left) / scale, y: (box.top - base.top) / scale, width: box.width / scale };
    };
    this.words.forEach((item) => {
      item.from = place(item.ghost);
      item.to = item.target ? place(item.target) : null;
    });
  },
  render(t, plan) {
    const count = this.words.length;
    let lastShown = null;
    this.words.forEach((item, i) => {
      const shown = t >= 0.3 + (i / count) * 2.5;
      if (shown) {
        lastShown = item;
      }
      if (item.to) {
        const start = plan.fly + i * 0.03;
        const p = progress(t, start, start + 1.3);
        const size = lerp(1, 38 / 52, p);
        item.fly.style.transform = `translate(${lerp(item.from.x, item.to.x, p)}px, ${lerp(item.from.y, item.to.y, p)}px) scale(${size})`;
        item.fly.style.opacity = shown ? "1" : "0";
        item.fly.style.color = p > 0 && p < 1 ? SPEAKERS[item.who].colour : "var(--mist)";
      } else {
        const fade = progress(t, plan.fly - 0.2, plan.fly + 0.4);
        item.fly.style.transform = `translate(${item.from.x}px, ${item.from.y - fade * 30}px)`;
        item.fly.style.opacity = shown ? String(1 - fade) : "0";
      }
    });
    const caret = document.getElementById("caret");
    if (lastShown && t < plan.fly - 0.1) {
      caret.style.transform = `translate(${lastShown.from.x + lastShown.from.width}px, ${lastShown.from.y + 8}px)`;
      caret.style.opacity = Math.floor(t * 2.4) % 2 === 0 ? "1" : "0.25";
    } else {
      caret.style.opacity = "0";
    }
    SPEAKERS.forEach((speaker, k) => {
      const p = progress(t, plan.fly + 0.1 + k * 0.15, plan.fly + 1 + k * 0.15);
      speaker.bubble.style.opacity = String(p);
      speaker.bubble.style.transform = `translateY(${lerp(40, 0, p)}px) scale(${lerp(0.94, 1, p)})`;
      const window = plan.talk[k];
      const isTalking = t >= window[0] && t < window[1];
      speaker.bubble.style.boxShadow = isTalking ? `0 0 60px -6px ${speaker.colour}` : "none";
      this.waves[k].forEach((bar, j) => {
        const height = 6 + (isTalking ? 54 : 4) * Math.abs(Math.sin(t * 9 + j * 0.7) * Math.sin(t * 3.3 + j * 0.23));
        bar.style.height = `${height}px`;
        bar.style.opacity = isTalking ? "1" : "0.45";
      });
    });
    const fold = progress(t, plan.fold, plan.fold + 0.9);
    const scene = document.getElementById("intro-scene");
    scene.style.transform = `scale(${lerp(1, 0.12, fold)})`;
    scene.style.opacity = String(1 - fold);
    const markIn = progress(t, plan.fold + 0.5, plan.fold + 1.3);
    const mark = document.getElementById("mark");
    mark.style.transform = `scale(${lerp(0.5, 1, markIn)}) rotate(${lerp(-25, 0, markIn)}deg)`;
    mark.style.opacity = String(markIn);
    [...document.getElementById("rings").children].forEach((ring, k) => {
      const life = clamp((t - plan.fold - 0.8 - k * 0.45) / 1.8);
      ring.style.transform = `scale(${lerp(0.6, 2.6, life)})`;
      ring.style.opacity = life > 0 && life < 1 ? String(0.6 * (1 - life)) : "0";
    });
    [...document.getElementById("word").children].forEach((letter, k) => {
      const p = progress(t, plan.fold + 1 + k * 0.07, plan.fold + 1.6 + k * 0.07);
      letter.style.opacity = String(p);
      letter.style.transform = `translateY(${lerp(40, 0, p)}px)`;
    });
    const tag = progress(t, plan.tag, plan.tag + 0.7);
    document.getElementById("tag").style.opacity = String(tag);
    document.getElementById("tag").style.transform = `translateY(${lerp(16, 0, tag)}px)`;
    const chip = progress(t, plan.chip, plan.chip + 0.7);
    document.getElementById("chip").style.opacity = String(chip);
    document.getElementById("chip").style.transform = `scale(${lerp(0.9, 1, chip)})`;
  },
  async lineLengths() {
    return Promise.all(
      INTRO_LINES.map(
        (line) =>
          new Promise((resolve) => {
            const probe = new Audio(line.url);
            probe.addEventListener("loadedmetadata", () => resolve(probe.duration), { once: true });
            probe.addEventListener("error", () => resolve(3), { once: true });
          }),
      ),
    );
  },
  async play() {
    const lengths = await this.lineLengths();
    const fly = Math.max(3.2, 0.4 + clipLength("hook-1") + 0.3);
    const hookTwo = fly + 0.2;
    let at = Math.max(fly + 1.9, hookTwo + clipLength("hook-2") + 0.4);
    const talk = lengths.map((length) => {
      const window = [at, at + length];
      at += length + 0.3;
      return window;
    });
    const fold = at + 0.2;
    const hookFour = fold + clipLength("hook-3") + 0.5;
    const plan = { fly, talk, fold, tag: hookFour + 0.6, chip: hookFour + 1.2, end: hookFour + clipLength("hook-4") + 2.4 };
    const events = [
      [0.4, () => speak("hook-1")],
      [hookTwo, () => speak("hook-2")],
      ...INTRO_LINES.map((line, k) => [talk[k][0], () => sound.play(line.url, sound.voices)]),
      [fold, () => speak("hook-3")],
      [hookFour, () => speak("hook-4")],
    ];
    const started = performance.now();
    events.forEach(([time, action]) => setTimeout(action, time * 1000));
    await new Promise((resolve) => {
      const tick = (now) => {
        const t = (now - started) / 1000;
        this.render(t, plan);
        if (t >= plan.end) {
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  },
};

const NODES = {
  story: { x: 90, y: 370, w: 400, h: 210, colour: "var(--sky)", title: "Your story", text: "Text, a web page link or an idea, and a length of 1, 2 or 3 minutes" },
  server: { x: 640, y: 100, w: 460, h: 240, colour: "var(--bloom)", title: "Castwave server", text: "Reads web pages, asks for the script and the casting, and keeps every API key" },
  llm: { x: 1250, y: 90, w: 580, h: 150, colour: "var(--haze)", brand: true, title: "LLM Gateway", text: "Writes the scenes, choices and endings, and picks a voice for each character" },
  token: { x: 1250, y: 265, w: 580, h: 120, colour: "var(--haze)", brand: true, title: "Streaming tokens", text: "A single-use token for the browser" },
  pictures: { x: 1250, y: 410, w: 580, h: 105, colour: "var(--amber)", outside: true, title: "Pollinations", text: "A picture for every scene" },
  voicing: { x: 640, y: 520, w: 460, h: 190, colour: "var(--mint)", title: "Browser voicing", text: "Streams every line, up to four voices at once" },
  tts: { x: 1250, y: 545, w: 580, h: 225, colour: "var(--haze)", brand: true, title: "Streaming text-to-speech", text: "18 voices matched to gender and age, 24 kHz audio and word timings for every line" },
  studio: { x: 640, y: 750, w: 460, h: 140, colour: "var(--rose)", title: "Studio player", text: "Word-by-word captions, effects and choices" },
};
const EDGES = {
  story: { path: "M490 475 C565 475 565 230 640 230" },
  llm: { path: "M1100 165 L1250 165", both: true },
  token: { path: "M1100 250 C1175 250 1175 325 1250 325" },
  pictures: { path: "M1100 310 C1175 310 1175 462 1250 462" },
  down: { path: "M870 340 L870 520" },
  tts: { path: "M1100 615 C1175 615 1175 650 1250 650", both: true },
  play: { path: "M870 710 L870 750" },
  timings: { path: "M1250 730 C1175 730 1175 820 1100 820" },
};
const ARCH_STEPS = [
  ["arch-input", ["story", "server"], ["story"]],
  ["arch-llm", ["server", "llm"], ["llm"]],
  ["arch-tokens", ["server", "token", "voicing"], ["token", "down"]],
  ["arch-tts", ["voicing", "tts"], ["tts"]],
  ["arch-timings", ["tts", "voicing", "studio"], ["timings", "play"]],
  ["arch-pictures", ["server", "pictures"], ["pictures"]],
];

const architecture = {
  lit: new Set(),
  running: false,
  build() {
    const holder = document.getElementById("nodes");
    Object.entries(NODES).forEach(([name, node]) => {
      const box = document.createElement("div");
      box.className = `node${node.outside ? " outside" : ""}`;
      box.style.cssText = `left:${node.x}px;top:${node.y}px;width:${node.w}px;height:${node.h}px;--c:${node.colour}`;
      box.innerHTML = `<div class="node-title">${node.title}${node.brand ? '<span class="node-brand">AssemblyAI</span>' : ""}</div><div class="node-text">${node.text}</div>`;
      holder.append(box);
      node.element = box;
    });
    const svg = document.getElementById("edges");
    Object.values(EDGES).forEach((edge) => {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", edge.path);
      path.style.opacity = "0";
      svg.append(path);
      edge.element = path;
      edge.length = path.getTotalLength();
      edge.dots = [0, 1, 2].map(() => {
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("r", "7");
        dot.style.opacity = "0";
        svg.append(dot);
        return dot;
      });
    });
  },
  async reveal() {
    for (const name of ["story", "server", "voicing", "studio", "llm", "token", "tts", "pictures"]) {
      NODES[name].element.classList.add("on");
      await wait(180);
    }
    await wait(300);
    Object.values(EDGES).forEach((edge) => (edge.element.style.opacity = "1"));
  },
  focus(nodes, edges) {
    document.getElementById("arch").classList.toggle("focusing", nodes.length > 0);
    Object.entries(NODES).forEach(([name, node]) => node.element.classList.toggle("lit", nodes.includes(name)));
    this.lit = new Set(edges);
    Object.entries(EDGES).forEach(([name, edge]) => edge.element.classList.toggle("lit", this.lit.has(name)));
  },
  flowAll() {
    this.focus([], Object.keys(EDGES));
  },
  start() {
    this.running = true;
    const tick = (now) => {
      Object.entries(EDGES).forEach(([name, edge]) => {
        const isLit = this.lit.has(name);
        edge.dots.forEach((dot, k) => {
          if (!isLit) {
            dot.style.opacity = "0";
            return;
          }
          let share = ((now / 1600 + k / 3) % 1 + 1) % 1;
          if (edge.both && k % 2 === 1) {
            share = 1 - share;
          }
          const point = edge.element.getPointAtLength(share * edge.length);
          dot.setAttribute("cx", String(point.x));
          dot.setAttribute("cy", String(point.y));
          dot.style.opacity = String(Math.sin(share * Math.PI));
        });
      });
      if (this.running) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  },
  stop() {
    this.running = false;
  },
};

function isOnScreen(box) {
  return box.top >= 0 && box.bottom <= STAGE_HEIGHT && box.left >= 0 && box.right <= STAGE_WIDTH;
}

async function settle(element) {
  let last = -1;
  let steady = 0;
  while (steady < 3) {
    await wait(100);
    const top = Math.round(element.getBoundingClientRect().top);
    steady = top === last ? steady + 1 : 0;
    last = top;
  }
  return element.getBoundingClientRect();
}

async function bringIntoView(element) {
  const box = element.getBoundingClientRect();
  if (isOnScreen(box)) {
    return box;
  }
  await camera.wide();
  element.scrollIntoView({ block: box.height > STAGE_HEIGHT - 160 ? "start" : "center", behavior: "smooth" });
  return settle(element);
}

const camera = {
  current: "translate(0px, 0px) scale(1)",
  async move(transform) {
    if (transform === this.current) {
      return;
    }
    this.current = transform;
    world.style.transform = transform;
    await wait(CAMERA_TIME);
  },
  async focus(element, { maxZoom = 1.8, padding = 56 } = {}) {
    await highlight.off();
    const box = await bringIntoView(element);
    const fits = Math.min(STAGE_WIDTH / (box.width + padding * 2), STAGE_HEIGHT / (box.height + padding * 2));
    const scale = Math.max(1, Math.min(maxZoom, fits));
    const x = clamp(STAGE_WIDTH / 2 - (box.left + box.width / 2) * scale, STAGE_WIDTH - STAGE_WIDTH * scale, 0);
    const y = clamp(STAGE_HEIGHT / 2 - (box.top + box.height / 2) * scale, STAGE_HEIGHT - STAGE_HEIGHT * scale, 0);
    await this.move(`translate(${Math.round(x)}px, ${Math.round(y)}px) scale(${scale.toFixed(3)})`);
  },
  async wide() {
    await highlight.off();
    await this.move("translate(0px, 0px) scale(1)");
  },
};

const highlight = {
  async on(element, padding = 14) {
    const box = await settle(element);
    if (!spotlight.hidden) {
      spotlight.hidden = true;
      await wait(FADE_TIME);
    }
    Object.assign(spotlight.style, {
      left: `${box.left - padding}px`,
      top: `${box.top - padding}px`,
      width: `${box.width + padding * 2}px`,
      height: `${box.height + padding * 2}px`,
    });
    spotlight.hidden = false;
    await wait(FADE_TIME);
  },
  async off() {
    if (!spotlight.hidden) {
      spotlight.hidden = true;
      await wait(FADE_TIME);
    }
  },
};

async function show(element, options) {
  await camera.focus(element, options);
  await highlight.on(element);
}

async function click(element) {
  const box = await bringIntoView(element);
  const x = box.left + Math.min(box.width / 2, 60);
  const y = box.top + box.height / 2;
  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;
  await wait(800);
  cursor.classList.add("pointing");
  await wait(300);
  cursor.classList.add("pressed");
  element.classList.add("cw-pressed");
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.classList.remove("go");
  void ripple.offsetWidth;
  ripple.classList.add("go");
  await wait(180);
  cursor.classList.remove("pressed");
  element.classList.remove("cw-pressed");
  element.click();
  await wait(400);
  cursor.classList.remove("pointing");
}

async function type(field, text, perCharacter = 42) {
  const setValue = Object.getOwnPropertyDescriptor(frame.contentWindow.HTMLTextAreaElement.prototype, "value").set;
  field.focus();
  for (let length = 0; length <= text.length; length += 1) {
    setValue.call(field, text.slice(0, length));
    field.dispatchEvent(new Event("input", { bubbles: true }));
    await wait(perCharacter);
  }
}

function startLiveTimer(label) {
  const started = Date.now();
  live.hidden = false;
  const tick = () => {
    const seconds = Math.floor((Date.now() - started) / 1000);
    document.getElementById("live-text").textContent = `${label} · ${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  };
  tick();
  const timer = setInterval(tick, 500);
  return {
    relabel(next) {
      label = next;
      tick();
    },
    stop() {
      clearInterval(timer);
      live.hidden = true;
    },
  };
}

async function pause() {
  const button = await waitFor(() => findByText("button", "Pause"), 3000).catch(() => null);
  if (button) {
    await click(button);
  }
}

const sceneStage = () => find("figure[data-ambience]");
const isScriptWritten = () => {
  const title = find("#preparing-title");
  return title && !title.textContent.includes("Writing your script");
};

function skipToSceneEnd() {
  const rows = app().querySelectorAll("li[data-status]");
  rows[rows.length - 1]?.querySelector("button")?.click();
}

const INTRO = [
  async () => {
    setScene("intro");
    await intro.play();
  },
];

const ARCHITECTURE = [
  async () => {
    setScene("arch");
    architecture.start();
    await wait(700);
    await Promise.all([speak("arch"), architecture.reveal()]);
    for (const [clip, nodes, edges] of ARCH_STEPS) {
      architecture.focus(nodes, edges);
      await wait(350);
      await speak(clip);
      await wait(250);
    }
    architecture.flowAll();
    await wait(1800);
  },
];

const DEMO = [
  async () => {
    setScene("app");
    await wait(1000);
    architecture.stop();
    const voice = speak("make");
    const tabs = await waitFor(() => find('[aria-label="Source"]'));
    await show(tabs, { maxZoom: 2 });
    await click(findByText('[role="tab"]', "From an idea"));
    const idea = await waitFor(() => find('textarea[name="idea"]'));
    await show(idea, { maxZoom: 1.7 });
    await type(idea, IDEA);
    await show(find('[aria-label="Length"]'), { maxZoom: 2 });
    await click(findByText('[aria-label="Length"] button', "2 min"));
    await show(find('input[name="format"]').closest("fieldset"), { maxZoom: 1.6 });
    await click(find('input[name="format"][value="interactive"]').closest("label"));
    await voice;
    const create = find('button[type="submit"]');
    await show(create, { maxZoom: 2 });
    await click(create);
    await wait(600);
  },
  async () => {
    await camera.wide();
    const timer = startLiveTimer("Writing the script with LLM Gateway");
    await waitFor(() => find('[aria-labelledby="preparing-title"]'), 20000);
    await wait(800);
    await speak("wait");
    await waitFor(isScriptWritten, 240000);
    timer.relabel("Voicing every line with AssemblyAI");
    await wait(1500);
    const prep = speak("prep");
    const rings = await waitFor(() => find('[aria-label="Lines voiced for each character"]'));
    await show(rings.parentElement, { maxZoom: 1.7 });
    await wait(2200);
    const map = await waitFor(() => find('svg[aria-label^="Map of the story"]'));
    await show(map.parentElement, { maxZoom: 1.6 });
    await prep;
    await wait(1200);
    await camera.wide();
    const open = await waitFor(() => findByText("button", "Open the Studio"), 600000);
    timer.stop();
    await show(open, { maxZoom: 1.8 });
    await click(open);
  },
  async () => {
    const play = await waitFor(() => findByText("button", "Play the whole script"));
    await camera.wide();
    await highlight.on(play);
    await speak("play");
    await click(play);
    const scene = await waitFor(sceneStage);
    await camera.focus(scene, { maxZoom: 1.5, padding: 40 });
    await wait(12000);
    skipToSceneEnd();
    let hasExplained = false;
    for (let turn = 0; turn < 5; turn += 1) {
      const next = await waitFor(() => find('[aria-label="Your choice"]') ?? find('figure [aria-label="The end"]'), 120000);
      if (next.matches('[aria-label="The end"]')) {
        break;
      }
      await camera.focus(next, { maxZoom: 1.6 });
      await highlight.on(next);
      if (hasExplained) {
        await wait(1500);
      } else {
        await speak("choose");
        hasExplained = true;
      }
      await click(next.querySelector("button"));
      await highlight.off();
      await camera.focus(sceneStage(), { maxZoom: 1.5, padding: 40 });
      await wait(7000);
      skipToSceneEnd();
    }
    const ending = find('figure [aria-label="The end"]');
    await camera.focus(ending, { maxZoom: 1.6 });
    await highlight.on(ending);
    await speak("ending");
    await click(findByText('figure [aria-label="The end"] button', "See your path"));
    await highlight.off();
    const card = [...app().querySelectorAll('[aria-label="The end"]')].at(-1);
    await wait(1200);
    await camera.focus(card, { maxZoom: 1.3, padding: 40 });
    await wait(4000);
  },
  async () => {
    await camera.wide();
    frame.contentWindow.scrollTo({ top: 0, behavior: "smooth" });
    await wait(1200);
    await click(findByText("button", "Stories"));
    const menu = await waitFor(() => find('[role="dialog"][aria-label="Stories"]'));
    await show(menu, { maxZoom: 1.6 });
    await speak("showcase");
    await click(findByText('[role="dialog"] button', "The French Lady"));
    await camera.wide();
    const scene = await waitFor(() => (find("#script-title")?.textContent.includes("French") ? sceneStage() : null), 20000);
    await wait(1500);
    const play = findByText("button", "Play the whole script");
    if (play) {
      await click(play);
    }
    await camera.focus(scene, { maxZoom: 1.5, padding: 40 });
    await wait(12000);
    await camera.wide();
    await pause();
  },
];

const END = [
  async () => {
    setScene("end");
    await wait(600);
    document.getElementById("end").classList.add("show");
    await wait(1200);
    await speak("outro");
    await wait(3500);
  },
];

async function run(timeline) {
  for (const step of timeline) {
    await step();
  }
}

function startRecording() {
  const mimeType = "audio/webm;codecs=opus";
  const recorder = new MediaRecorder(sound.record.stream, { mimeType, audioBitsPerSecond: 192000 });
  recorder.onstart = () => {
    window.recordingStartedAt = Date.now();
  };
  const chunks = [];
  recorder.ondataavailable = (event) => chunks.push(event.data);
  const saved = new Promise((resolve) => {
    recorder.onstop = () => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob(chunks, { type: mimeType }));
      link.download = "castwave-demo.webm";
      link.click();
      resolve();
    };
  });
  recorder.start(1000);
  return { stop: () => (recorder.stop(), saved) };
}

async function visit(path) {
  const loaded = new Promise((resolve) => frame.addEventListener("load", resolve, { once: true }));
  frame.src = path;
  await loaded;
  await wait(1500);
}

async function warmUp() {
  await visit("/studio");
  await visit("/");
  captions = await (await fetch("/demo/narration/captions.json")).json();
  await document.fonts.ready;
  intro.measure();
}

const PARTS = { intro: INTRO, arch: ARCHITECTURE, demo: DEMO, end: END };

async function begin(shouldRecord, only = Object.keys(PARTS)) {
  document.getElementById("controls").hidden = true;
  sound.start();
  await sound.mix.resume();
  sound.tapApp(frame.contentWindow);
  await warmUp();
  const recording = shouldRecord ? startRecording() : null;
  await wait(600);
  try {
    await run(only.flatMap((name) => PARTS[name]));
  } finally {
    await recording?.stop();
  }
}

function prepareApp() {
  const style = app().createElement("style");
  style.textContent = `
    nextjs-portal { display: none !important; }
    .cw-pressed { transform: scale(0.95) !important; filter: brightness(1.25) !important; transition: transform 0.12s ease, filter 0.12s ease !important; }
  `;
  app().head.append(style);
  sound.tapApp(frame.contentWindow);
}

document.querySelector(".address").textContent = location.host;
intro.build();
architecture.build();
fitStage();
window.addEventListener("resize", fitStage);
frame.addEventListener("load", prepareApp);
document.getElementById("record").addEventListener("click", () => void begin(true));
document.getElementById("play").addEventListener("click", () => void begin(false));
window.castwaveDemo = { begin };
