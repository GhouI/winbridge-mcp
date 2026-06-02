export type AppConfig = {
  name: string;
  version: string;
  host: string;
  port: number;
  endpointPath: string;
  authToken: string;
  allowedOrigins: string[];
  shellPath?: string;
  defaultCwd: string;
  defaultTimeoutMs: number;
  maxOutputBytes: number;
};

const DEFAULT_PORT = 7573;
const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_MAX_OUTPUT_BYTES = 1024 * 1024;

function readNumberEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) {
    return fallback;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive number`);
  }

  return parsed;
}

function readListEnv(name: string): string[] {
  const raw = process.env[name];
  if (!raw) {
    return [];
  }

  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

export function loadConfig(): AppConfig {
  const authToken = process.env.PENDRAGON_TOKEN;
  if (!authToken) {
    throw new Error("PENDRAGON_TOKEN is required");
  }

  return {
    name: "pendragon-mcp",
    version: "0.1.0",
    host: process.env.PENDRAGON_HOST ?? "127.0.0.1",
    port: readNumberEnv("PENDRAGON_PORT", DEFAULT_PORT),
    endpointPath: process.env.PENDRAGON_ENDPOINT_PATH ?? "/mcp",
    authToken,
    allowedOrigins: readListEnv("PENDRAGON_ALLOWED_ORIGINS"),
    shellPath: process.env.PENDRAGON_SHELL_PATH,
    defaultCwd: process.env.PENDRAGON_CWD ?? process.cwd(),
    defaultTimeoutMs: readNumberEnv("PENDRAGON_TIMEOUT_MS", DEFAULT_TIMEOUT_MS),
    maxOutputBytes: readNumberEnv("PENDRAGON_MAX_OUTPUT_BYTES", DEFAULT_MAX_OUTPUT_BYTES)
  };
}
