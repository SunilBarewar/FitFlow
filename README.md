# FitFlow

**Train smart, live stronger.** FitFlow is an AI-powered fitness coach that combines conversational setup with structured workout plans, live session tracking, and safety-aware guidance—not a generic chatbot wrapped around a form.

- **Marketing site** at `/` — product story, FAQ, and sign-up CTAs
- **Coach** at `/chat` — generative chat UI plus a live plan/progress panel (mobile-first; split pane on large screens)
- **Plan** at `/plan` — weekly view and workout details
- **Auth** at `/sign-in` and `/sign-up` — email/password sessions backed by MongoDB

## Tech stack

| Layer | Choices |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, [shadcn/ui](https://ui.shadcn.com), OKLCH design tokens in `src/app/globals.css` |
| Data | MongoDB via Mongoose |
| Auth | JWT session cookie (`fitflow_session`), bcrypt password hashing |
| AI | [Vercel AI SDK](https://sdk.vercel.ai) (`ToolLoopAgent`), provider keys for OpenAI / Google Gemini / OpenRouter (see coach agent config) |
| Client data | TanStack Query |
| Tooling | [Biome](https://biomejs.dev) for lint and format |

## Prerequisites

- **Node.js** 20+
- **MongoDB** — local instance or [Atlas](https://www.mongodb.com/atlas); connection string goes in `MONGODB_URI`
- **LLM API key** — the coach agent is configured in `src/features/coach/agent/coach-agent.ts` (currently OpenAI `gpt-5.1`; Google and OpenRouter clients are also wired for flexibility)

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy the example file and fill in values:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Purpose |
   | --- | --- |
   | `MONGODB_URI` | MongoDB connection string |
   | `AUTH_SECRET` | Session signing secret (≥ 32 chars; e.g. `openssl rand -base64 32`) |
   | `GOOGLE_GENERATIVE_AI_API_KEY` | Google Gemini (optional unless you switch the coach model) |
   | `OPENAI_API_KEY` | OpenAI (required with the default coach model) |
   | `OPENROUTER_API_KEY` | OpenRouter (optional unless you switch the coach model) |

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Use `/chat` after creating an account.

4. **Verify the database** (optional)

   With the app running and `MONGODB_URI` set, `GET /api/health/db` confirms connectivity.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run Biome checks |
| `npm run format` | Format with Biome |

## Project layout

```
src/
├── app/                    # Routes, API handlers, landing page
│   ├── (app)/              # Authenticated app (chat, plan)
│   ├── (auth)/             # Sign-in / sign-up
│   └── api/                # REST: auth, coach, workout, health
├── features/
│   ├── auth/               # Client hooks and auth API helpers
│   ├── chat/               # Coach UI, generative blocks, conversation hooks
│   ├── coach/              # Agent instructions, tools, widget schema
│   └── workout/            # Today’s session, plan week, session sync
├── components/             # Shared UI (shadcn extensions, brand, auth shell)
├── lib/                    # DB connect, auth/JWT, exercises, utilities
└── models/                 # Mongoose schemas (user, conversation, messages, sessions)
```

Feature code lives under `src/features/*`; cross-cutting infrastructure lives under `src/lib` and `src/models`. Cursor rules in `.cursor/rules/` summarize the design system for agents.

---

FitFlow provides general fitness education and coaching UX; it does not replace medical or physiotherapy advice. 
