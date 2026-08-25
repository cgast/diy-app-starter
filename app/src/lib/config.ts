import path from "node:path";

// All paths default to a local `.data/` folder so `npm run dev` works
// without Docker. In docker-compose these are overridden to point at
// mounted volumes shared with the pi-web sidecar.
const dataRoot = process.env.DATA_ROOT ?? path.join(process.cwd(), ".data");

export const config = {
  dbPath: process.env.DB_PATH ?? path.join(dataRoot, "db", "app.db"),
  workspaceRoot: process.env.WORKSPACE_ROOT ?? path.join(dataRoot, "workspace"),
  runsDir: process.env.RUNS_DIR ?? path.join(dataRoot, "runs"),
  piAgentDir: process.env.PI_CODING_AGENT_DIR ?? path.join(dataRoot, "pi-agent"),
  piWebUrl: process.env.NEXT_PUBLIC_PI_WEB_URL ?? "http://localhost:30141",
};
