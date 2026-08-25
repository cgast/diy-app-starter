FROM node:22-bookworm-slim

# git: workspace repo + per-ticket worktrees.
# python3/make/g++: build toolchain for the better-sqlite3 native module.
RUN apt-get update && apt-get install -y --no-install-recommends \
    git python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# The pi coding agent CLI — the harness this app drives per ticket.
RUN npm install -g @earendil-works/pi-coding-agent

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000
CMD ["npm", "run", "start"]
