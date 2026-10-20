const STAGE_WIDTH = 1920;
const STAGE_HEIGHT = 1080;
const DIAGRAM_SCALE = 1000 / 860;
const NARRATION_SPEED = 1;
const IDEA = "A night guard at an old wax museum hears the figures whisper his name.";

const stage = document.getElementById("stage");
const world = document.getElementById("world");
const frame = document.getElementById("app");
const spotlight = document.getElementById("spotlight");
const cursor = document.getElementById("cursor");
const ripple = document.getElementById("ripple");
const caption = document.getElementById("caption");
const live = document.getElementById("live");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const app = () => frame.contentDocument;
const find = (selector) => app().querySelector(selector);
const findByText = (selector, text) => [...app().querySelectorAll(selector)].find((node) => node.textContent.includes(text));

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

function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

async function measure(element) {
  element.scrollIntoView({ block: "center", behavior: "smooth" });
  await wait(650);
  return element.getBoundingClientRect();
}

const camera = {
  async focus(element, zoom = 1.6, padding = 48) {
    const box = await measure(element);
    const fits = Math.min(STAGE_WIDTH / (box.width + padding * 2), STAGE_HEIGHT / (box.height + padding * 2));
    const scale = Math.max(1, Math.min(zoom, fits));
    const x = clamp(STAGE_WIDTH / 2 - (box.left + box.width / 2) * scale, STAGE_WIDTH - STAGE_WIDTH * scale, 0);
    const y = clamp(STAGE_HEIGHT / 2 - (box.top + box.height / 2) * scale, STAGE_HEIGHT - STAGE_HEIGHT * scale, 0);
    world.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    const screenBottom = y + (box.top + box.height + padding) * scale;
    caption.dataset.position = screenBottom > STAGE_HEIGHT - 220 ? "top" : "bottom";
    return box;
  },
  wide() {
    world.style.transform = "translate(0px, 0px) scale(1)";
    caption.dataset.position = "bottom";
  },
};

function placeSpotlight(light, box, padding) {
  Object.assign(light.style, {
    left: `${box.left - padding}px`,
    top: `${box.top - padding}px`,
    width: `${box.width + padding * 2}px`,
    height: `${box.height + padding * 2}px`,
  });
  light.hidden = false;
}

const highlight = {
  on(element, padding = 14) {
    placeSpotlight(spotlight, element.getBoundingClientRect(), padding);
  },
  off() {
    spotlight.hidden = true;
  },
};

const diagram = {
  light: document.getElementById("diagram-spotlight"),
  show() {
    document.getElementById("diagram").hidden = false;
  },
  hide() {
    document.getElementById("diagram").hidden = true;
    this.light.hidden = true;
  },
  focus([x, y, width, height]) {
    const box = { left: x * DIAGRAM_SCALE, top: y * DIAGRAM_SCALE, width: width * DIAGRAM_SCALE, height: height * DIAGRAM_SCALE };
    placeSpotlight(this.light, box, 8);
  },
  wide() {
    this.light.hidden = true;
  },
};

const DIAGRAM_AREAS = {
  llm: [704, 144, 272, 386],
  casting: [704, 144, 352, 574],
  tts: [54, 144, 272, 386],
  stt: [334, 144, 272, 386],
  tokens: [984, 144, 242, 386],
};

async function click(element) {
  const box = element.getBoundingClientRect();
  const x = box.left + Math.min(box.width / 2, 60);
  const y = box.top + box.height / 2;
  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;
  await wait(650);
  cursor.classList.add("pointing");
  await wait(350);
  cursor.classList.add("pressed");
  ripple.style.left = `${x}px`;
  ripple.style.top = `${y}px`;
  ripple.classList.remove("go");
  void ripple.offsetWidth;
  ripple.classList.add("go");
  await wait(140);
  cursor.classList.remove("pressed");
  element.click();
  await wait(450);
  cursor.classList.remove("pointing");
}

async function type(field, text, perCharacter = 45) {
  const setValue = Object.getOwnPropertyDescriptor(frame.contentWindow.HTMLTextAreaElement.prototype, "value").set;
  field.focus();
  for (let length = 0; length <= text.length; length += 1) {
    setValue.call(field, text.slice(0, length));
    field.dispatchEvent(new Event("input", { bubbles: true }));
    await wait(perCharacter);
  }
}

function say(kicker, title) {
  document.getElementById("caption-kicker").textContent = kicker;
  document.getElementById("caption-title").textContent = title;
  caption.hidden = false;
}

function quiet() {
  caption.hidden = true;
}

function narrate(name) {
  const voice = new Audio(`/demo/narration/${name}.mp3`);
  voice.preservesPitch = true;
  voice.playbackRate = NARRATION_SPEED;
  return new Promise((resolve) => {
    voice.addEventListener("ended", resolve, { once: true });
    voice.addEventListener("error", resolve, { once: true });
    void voice.play();
  });
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
  return () => {
    clearInterval(timer);
    live.hidden = true;
  };
}

const isScriptWritten = () => {
  const title = find("#preparing-title");
  return title && !title.textContent.includes("Writing your script");
};

const FIRST_TWO_MINUTES = [
  async () => {
    document.getElementById("intro").hidden = false;
    await Promise.all([narrate("intro"), wait(4000)]);
    document.getElementById("intro").hidden = true;
    await wait(900);
  },
  async () => {
    say("Step 1 · Bring a story", "Paste text, a website link or an idea");
    const tabs = await waitFor(() => find('[role="tablist"]'));
    await camera.focus(tabs, 2.2);
    highlight.on(tabs);
    await narrate("sources");
    await click(findByText('[role="tab"]', "From an idea"));
    const idea = await waitFor(() => find('textarea[name="idea"]'));
    await camera.focus(idea, 1.9);
    highlight.on(idea);
    await type(idea, IDEA);
    await wait(800);
  },
  async () => {
    say("Step 2 · Pick a format", "Audiobook, podcast or an interactive story");
    const interactive = find('input[name="format"][value="interactive"]');
    const picker = interactive.closest("fieldset");
    await camera.focus(picker, 1.8);
    highlight.on(picker);
    await narrate("formats");
    await click(interactive.closest("label"));
    await wait(600);
  },
  async () => {
    say("Step 3 · Create", "One click writes, casts and voices the whole story");
    const create = find('button[type="submit"]');
    await camera.focus(create, 2.4);
    highlight.on(create);
    await Promise.all([narrate("create"), click(create)]);
    await wait(500);
  },
  async () => {
    highlight.off();
    quiet();
    camera.wide();
    const stopTimer = startLiveTimer("LLM Gateway is writing the script, live");
    diagram.show();
    await wait(900);
    say("Under the hood", "Four AssemblyAI products, one performance");
    for (const area of ["llm", "casting", "tts", "stt", "tokens"]) {
      diagram.focus(DIAGRAM_AREAS[area]);
      await narrate(area);
      await wait(300);
    }
    diagram.wide();
    say("Still writing, live", "Every scene, every branch, every ending");
    await narrate("live");
    await waitFor(isScriptWritten);
    stopTimer();
    diagram.hide();
    quiet();
    await wait(900);
  },
  async () => {
    say("Step 4 · Cast and voice", "A voice for every character, voiced before you play");
    const rings = await waitFor(() => find('[aria-label="Lines voiced for each character"]'));
    const panel = rings.parentElement;
    await camera.focus(panel, 1.8);
    highlight.on(panel);
    await narrate("cast");
    await wait(500);
  },
  async () => {
    say("No spoilers", "Every path stays locked until you reach it");
    const map = await waitFor(() => find('svg[aria-label^="Map of the story"]'));
    const panel = map.closest("div").parentElement;
    await camera.focus(panel, 1.6);
    highlight.on(panel);
    await narrate("map");
    await wait(800);
  },
  async () => {
    highlight.off();
    quiet();
    camera.wide();
    await wait(2500);
  },
];

async function run(timeline) {
  for (const step of timeline) {
    await step();
  }
}

function pickRecordingType(audioOnly) {
  if (audioOnly) {
    return { mimeType: "audio/webm;codecs=opus", extension: "webm" };
  }
  const mp4 = "video/mp4;codecs=avc1,mp4a.40.2";
  return MediaRecorder.isTypeSupported(mp4) ? { mimeType: mp4, extension: "mp4" } : { mimeType: "video/webm;codecs=vp9,opus", extension: "webm" };
}

async function startRecording(withMicrophone, audioOnly) {
  const screen = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: 30, width: STAGE_WIDTH, height: STAGE_HEIGHT, displaySurface: "browser" },
    audio: true,
    preferCurrentTab: true,
  });
  const tracks = audioOnly ? [] : [...screen.getVideoTracks()];
  const mixer = new AudioContext();
  const output = mixer.createMediaStreamDestination();
  if (screen.getAudioTracks().length > 0) {
    mixer.createMediaStreamSource(screen).connect(output);
  }
  if (withMicrophone) {
    const microphone = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } });
    mixer.createMediaStreamSource(microphone).connect(output);
  }
  tracks.push(...output.stream.getAudioTracks());
  const { mimeType, extension } = pickRecordingType(audioOnly);
  const recorder = new MediaRecorder(new MediaStream(tracks), { mimeType, videoBitsPerSecond: 8000000, audioBitsPerSecond: 192000 });
  recorder.onstart = () => {
    window.recordingStartedAt = Date.now();
  };
  const chunks = [];
  recorder.ondataavailable = (event) => chunks.push(event.data);
  const saved = new Promise((resolve) => {
    recorder.onstop = () => {
      const link = document.createElement("a");
      link.href = URL.createObjectURL(new Blob(chunks, { type: mimeType }));
      link.download = `castwave-demo.${extension}`;
      link.click();
      screen.getTracks().forEach((track) => track.stop());
      resolve();
    };
  });
  recorder.start(1000);
  return { stop: () => (recorder.stop(), saved) };
}

async function begin(shouldRecord, withMicrophone = document.getElementById("use-microphone").checked, audioOnly = false) {
  document.getElementById("controls").hidden = true;
  hideDevelopmentBadge();
  const recording = shouldRecord ? await startRecording(withMicrophone, audioOnly) : null;
  await wait(800);
  await run(FIRST_TWO_MINUTES);
  await recording?.stop();
}

function hideDevelopmentBadge() {
  const style = app().createElement("style");
  style.textContent = "nextjs-portal { display: none !important; }";
  app().head.append(style);
}

fitStage();
window.addEventListener("resize", fitStage);
frame.addEventListener("load", hideDevelopmentBadge);
document.getElementById("record").addEventListener("click", () => void begin(true));
document.getElementById("play").addEventListener("click", () => void begin(false));
window.castwaveDemo = { begin };
