# Castwave

Paste anything. Hear it performed.

Castwave turns a story, a web page or an idea into an audiobook, a two-host podcast or an interactive story. Every character gets their own voice from AssemblyAI.

## Run it

```
cp .env.example .env.local
npm install
npm run dev
```

Put your AssemblyAI API key in `.env.local`.

## Folders

| Folder | What it holds |
|---|---|
| `src/app/` | routes only: the Create page and the Studio page |
| `src/components/` | one folder per component, grouped into `ui`, `create`, `studio` and `background` |
| `src/hooks/` | browser work: voice sessions, audio output, voice effects, sound cues, spoken choices |
| `src/types/` | zod schemas that both the browser and the server use |
| `src/server/actions/` | Server Actions, one per file |
| `src/server/services/` | reading pages, writing scripts, casting voices, making tokens |
| `src/styles/theme.css` | colours, type and spacing, the only file with colours in it |
| `public/sounds/` | sound effects and ambience loops, with `CREDITS.md` |

Coding rules for agents live outside the project in `../Agent-Rules/`. See `AGENTS.md`.
