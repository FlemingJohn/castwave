# Rules

Before writing any code, read `../Agent-Rules/AGENTS.md` and follow it. The rules live outside this project, next to it.

# Project

Castwave turns a story, a web page or an idea into a performance. Each character gets its own voice, and the audio starts playing in about two seconds.

- Next.js 16 App Router, TypeScript, zod
- Voices come from the AssemblyAI Voice Agent API. Each speech cue gets its own session, with the line in `greeting` so it is spoken word for word.
- The browser opens the voice sessions itself, using single-use tokens from a Server Action. The API key never leaves the server.
- The three formats are audiobook, podcast and interactive. Each script is a list of scenes, and each scene is a list of cues.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
