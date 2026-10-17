# Castwave

Paste anything. Hear it performed.

Castwave turns a story, a web page or an idea into an audiobook, a two-host podcast or an interactive story. Every character gets their own voice from AssemblyAI.

Built for the AssemblyAI Text-to-Speech hackathon, October 15–23, 2026.

## Run it

```
cp .env.example .env.local
npm install
npm run dev
```

Put your AssemblyAI API key in `.env.local`, then open http://localhost:3000.

| Command | What it does |
|---|---|
| `npm run dev` | starts the app on port 3000 |
| `npm run build` | builds the app for production |
| `npm run typecheck` | checks the types |

## What works so far

| Part | State |
|---|---|
| Create page: paste text, website link or idea, with sample stories | built |
| Create page: audiobook, podcast and interactive formats | built |
| Header with the Create and Studio switch | built |
| Studio page: cast, script, player | placeholder |
| Writing the script with LLM Gateway | not started |
| Voices from the AssemblyAI Voice Agent API | not started |
| Sound effects, voice effects and spoken choices | not started |

## How it works

1. The Create page sends the text, link or idea to a Server Action.
2. LLM Gateway writes a script. A script is a list of scenes, and each scene is a list of cues. A cue is a spoken line or a sound effect.
3. Each character gets a voice and an optional effect, such as ghost, giant or child.
4. In the Studio, the browser opens one Voice Agent session for each spoken line, with the line in `greeting`, so it is spoken word for word. A Server Action makes single-use tokens, so the API key never leaves the server.
5. The next few lines are voiced while the current one plays, so playback has no gaps. In interactive stories the player picks what happens next by clicking or by speaking.

## Folders

| Folder | What it holds |
|---|---|
| `src/app/` | routes only: the Create page (`/`) and the Studio page (`/studio`) |
| `src/components/shell/` | the header and the Create and Studio switch |
| `src/components/ui/` | plain building blocks: `Button`, `Chip`, `Hint`, `Icon`, `TextArea` |
| `src/components/create/` | the Create page: source tabs, the three source panels, the format picker and the form |
| `src/components/studio/` | the Studio page |
| `src/components/background/` | the background shader |
| `src/hooks/` | browser work: voice sessions, audio output, voice effects, sound cues, spoken choices |
| `src/types/` | zod schemas that both the browser and the server use |
| `src/server/actions/` | Server Actions, one per file |
| `src/server/services/` | reading pages, writing scripts, casting voices, making tokens |
| `src/server/config/settings.ts` | reads and checks the environment settings |
| `src/styles/theme.css` | colours, type and spacing, the only file with colours in it |
| `public/sounds/` | sound effects and ambience loops, with `CREDITS.md` |

Each component has its own folder with its `.tsx` file, its `.module.css` file and its props type.

## Stack

Next.js 16 (App Router), React 19, TypeScript 7 in strict mode, zod 4 and CSS Modules. The fonts are Gabarito, Onest and Martian Mono, loaded with `next/font`.

## Coding rules

Coding rules for agents live outside the project in `../Agent-Rules/`. See `AGENTS.md`.
