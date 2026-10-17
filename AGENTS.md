# Rules

Before writing any code, read `../Agent-Rules/AGENTS.md` and follow it. The rules live outside this project, next to it.

# Project

Castwave turns a story, a web page or an idea into a performance. Each character gets its own voice, and the audio starts playing in about two seconds.

- Next.js 16 App Router, TypeScript, zod
- Voices come from the AssemblyAI Voice Agent API. Each speech cue gets its own session, with the line in `greeting` so it is spoken word for word.
- The browser opens the voice sessions itself, using single-use tokens from a Server Action. The API key never leaves the server.
- The three formats are audiobook, podcast and interactive. Each script is a list of scenes, and each scene is a list of cues.
