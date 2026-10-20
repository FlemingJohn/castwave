<p align="center"><img src="docs/banner.svg" alt="Castwave: paste anything, hear it performed" width="100%"></p>

<p align="center">
  <strong>Paste anything. Hear it performed.</strong><br>
  A story, a web page or an idea becomes an audiobook, a two-host podcast or an interactive story,<br>
  with a voice for every character and choices you can speak out loud.
</p>

<p align="center">
  Built for the AssemblyAI Text-to-Speech hackathon, October 15–23, 2026.
</p>

## Features

<table>
  <tr>
    <td width="56"><img src="docs/icons/sources.svg" width="44" alt=""></td>
    <td><strong>Three ways in</strong><br>Paste text, drop in a website link (the article is pulled out with Readability), or type a one-line idea.</td>
  </tr>
  <tr>
    <td><img src="docs/icons/formats.svg" width="44" alt=""></td>
    <td><strong>Three formats</strong><br>A full-cast audiobook that keeps the author's words, a two-host podcast, or an interactive story with two choices and four endings.</td>
  </tr>
  <tr>
    <td><img src="docs/icons/casting.svg" width="44" alt=""></td>
    <td><strong>A voice for every character</strong><br>LLM Gateway works out each character's gender and age, and Castwave picks a matching voice from 18, sorted by their measured pitch. Change any voice and only that character is voiced again.</td>
  </tr>
  <tr>
    <td><img src="docs/icons/voicing.svg" width="44" alt=""></td>
    <td><strong>Everything voiced up front</strong><br>A preparing screen voices every line of every scene and branch, up to four voices at once. "Play now" appears as soon as the opening is ready.</td>
  </tr>
  <tr>
    <td><img src="docs/icons/studio.svg" width="44" alt=""></td>
    <td><strong>Instant playback</strong><br>Play, choices and replays start in about 0.2 seconds, with word-by-word highlighting and an avatar for each speaker.</td>
  </tr>
  <tr>
    <td><img src="docs/icons/branching.svg" width="44" alt=""></td>
    <td><strong>A story map with no spoilers</strong><br>Scenes stay locked until you reach them. After an ending, the map shows the path you took and how many endings you have found.</td>
  </tr>
  <tr>
    <td><img src="docs/icons/speaking.svg" width="44" alt=""></td>
    <td><strong>Spoken choices</strong><br>Say "turn around and leave" or "the second one". AssemblyAI streaming speech-to-text hears it, and the story branches.</td>
  </tr>
  <tr>
    <td><img src="docs/icons/sounds.svg" width="44" alt=""></td>
    <td><strong>Sound effects and ambience</strong><br>Knocks, footsteps and thunder play where the narration mentions them, over rain, wind or city ambience picked from the setting.</td>
  </tr>
</table>

## Architecture

<p align="center"><img src="docs/architecture.svg" alt="Castwave architecture: the browser, the Next.js server and the AssemblyAI services" width="100%"></p>

| Part | What it does |
|---|---|
| **Create page** | Sends the text, link or idea and the format to a Server Action. |
| **Script writer** | Asks LLM Gateway for a script as JSON: scenes, speakers and cues. Retries up to three times, puts back any text the model dropped, and turns single-quoted dialogue into double-quoted dialogue first. For interactive stories it plans the outline, then writes the scenes four at a time. |
| **Casting** | Asks LLM Gateway for each character's gender and age, then picks a matching unused voice. |
| **Token maker** | Makes a single-use token for each socket, so the API key never reaches the browser. |
| **Voicing job** | Opens one streaming text-to-speech socket per voice, at most four at once, and voices every line. It keeps the audio and word timings in memory and reports progress to the preparing screen. |
| **Studio player** | Schedules the voiced audio back to back with Web Audio, with sound effects, ambience and word highlights. |
| **Choice listener** | Streams the microphone through an AudioWorklet to streaming speech-to-text, with the choice words sent as key terms, and matches the finished turn to a choice. |

### How it flows

1. **Bring a story.** You paste text, a link or an idea and pick a format.
2. **Write the script.** LLM Gateway returns scenes and lines. In audiobooks, sound cues and an ambience are added from the text.
3. **Cast the voices.** Each character gets a voice that fits their gender and age.
4. **Voice every line.** The browser voices the whole story, every branch included, before playback.
5. **Play.** Every line is already voiced, so nothing waits on the network.
6. **Speak a choice.** Your answer is transcribed live and the matching scene plays at once.

### AssemblyAI products used

| Product | Used for |
|---|---|
| Streaming text-to-speech | every spoken line, with word timings for highlighting |
| LLM Gateway | writing scripts, planning branching stories and describing characters for casting |
| Streaming speech-to-text | spoken choices, with key terms for better accuracy |
| Temporary tokens | single-use browser tokens for both streaming services |

## Tech stack

| Area | Tools |
|---|---|
| Framework | Next.js 16 (App Router, Server Actions), React 19 |
| Language | TypeScript 7 in strict mode |
| Validation | zod 4 for every outside reply: LLM output, socket events and stored scripts |
| Audio | Web Audio API, AudioWorklet, WebSockets |
| Web pages | Mozilla Readability and linkedom |
| Styling | CSS Modules, one theme file, and the fonts Outfit, Hanken Grotesk and IBM Plex Mono via `next/font` |
| Tests | Node's built-in test runner |

## Local setup

**You need:** Node.js 20.9 or newer, and an AssemblyAI API key from the [AssemblyAI dashboard](https://www.assemblyai.com/dashboard).

```bash
git clone https://github.com/FlemingJohn/castwave.git
cd castwave
npm install
cp .env.example .env.local
```

Open `.env.local` and add your key:

```bash
ASSEMBLYAI_API_KEY=your-key-here
```

Then start the app and open http://localhost:3000:

```bash
npm run dev
```

| Command | What it does |
|---|---|
| `npm run dev` | starts the app on port 3000 |
| `npm run build` | builds the app for production |
| `npm start` | runs the production build |
| `npm run typecheck` | checks the types |
| `npm test` | runs the unit tests |

Spoken choices need microphone access, which browsers only allow on `localhost` or over HTTPS.

## License

Castwave is released under the [MIT License](LICENSE). The sound effects in `public/sounds/` keep their own licenses, which are listed in [`public/sounds/CREDITS.md`](public/sounds/CREDITS.md).
