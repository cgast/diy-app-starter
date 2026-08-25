# self-dev-app-starter

A blank app that you grow by filing tickets, not by writing code yourself.
An AI agent ([`pi`](https://github.com/earendil-works/pi)) picks up tickets
from a kanban board and implements them in its own git worktree; you review
and merge from the same UI.

## The three perspectives

- **User** (`/`) and **Admin** (`/admin`) — the actual blank app your agents
  are building. Empty on purpose: it's whatever the tickets ask for.
- **Maintainer** (`/kanban`) — file tickets, watch them move
  `todo → in_progress → in_review → done`. Starting a ticket triggers a real
  agent run; nobody edits the workspace repo by hand.
- **Agent** (`/agents`) — the medium between you and the code. Lists every
  run with its log, and links into [pi-web](https://github.com/agegr/pi-web)
  to resume or watch a session live, browse the workspace's git worktrees,
  and tweak model/provider config.

## How a ticket becomes code

1. You add a ticket on `/kanban` and hit **Start agent**.
2. The backend creates a git worktree for that ticket
   (`.worktrees/ticket-<id>` on branch `agent/ticket-<id>`) off the
   **workspace** repo — a separate git repo from this starter/harness repo,
   so an agent run can never touch its own harness code.
3. `pi --print --mode json -a` runs headlessly in that worktree with the
   ticket's title/description as its prompt, writing session state under a
   directory shared with the `pi-web` sidecar.
4. When it exits, any changes get committed on the ticket's branch and the
   ticket moves to `in_review` for you to check the diff (via `pi-web`) and
   mark `done` — or send it back to `todo` to iterate.

## Running it

```bash
cp .env.example .env
# put a real ANTHROPIC_API_KEY (or your provider's key) in .env
docker compose up --build
```

- App: http://localhost:3000
- pi-web: http://localhost:30141

Everything (SQLite DB, the workspace repo, pi's session data, run logs)
lives in named Docker volumes, so `docker compose down` doesn't lose state
and `docker compose down -v` gives you a clean slate.

### Local dev without Docker

```bash
cd app
npm install
npm run dev
```

State defaults to `app/.data/` on disk. You'll additionally need the `pi`
CLI installed and on `PATH` (`npm install -g @earendil-works/pi-coding-agent`)
for the "Start agent" button to do anything, and a provider API key in your
environment.

## Project layout

```
app/            Next.js app: user/admin/kanban/agents UI + the API routes
                that own the DB, worktrees, and spawning `pi`
pi-web/         Dockerfile for the pi-web sidecar (no official image exists)
docker-compose.yml
```

## What's intentionally not built yet

This is a thin end-to-end slice, not the whole picture from the original
brief. Known gaps to grow into:

- **Skills/add-ons management** — installing/configuring `pi` extensions
  and skills per project from the maintainer UI instead of by hand.
- **Usage dashboard** — token/cost accounting across runs.
- **Meta / version history view** — a real diff/timeline over the
  workspace repo's commits, beyond `git log` and `pi-web`'s file browser.
- **Merging ticket branches to `main`** — right now branches just sit there
  after review; there's no merge step yet.
- **Drag-and-drop on the kanban board** — status changes are buttons for
  now.
- **Auth** — everything assumes a single trusted owner on a local network.
