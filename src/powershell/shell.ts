import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createOutputBuffer } from "./output.js";
import type { ExecuteOptions, PowerShellResult, PowerShellRuntimeOptions } from "./types.js";

export function resolveShellPath(configuredShellPath?: string): string {
  if (configuredShellPath) {
    return configuredShellPath;
  }

  return process.platform === "win32" ? "powershell.exe" : "pwsh";
}

export async function executePowerShell(
  runtime: PowerShellRuntimeOptions,
  options: ExecuteOptions
): Promise<PowerShellResult> {
  const commandId = randomUUID();
  const started = Date.now();
  const stdout = createOutputBuffer(options.maxOutputBytes ?? runtime.maxOutputBytes);
  const stderr = createOutputBuffer(options.maxOutputBytes ?? runtime.maxOutputBytes);
  const shellPath = resolveShellPath(runtime.shellPath);
  const timeoutMs = options.timeoutMs ?? runtime.defaultTimeoutMs;
  const child = spawn(
    shellPath,
    [
      "-NoLogo",
      "-NoProfile",
      "-NonInteractive",
      "-ExecutionPolicy",
      "Bypass",
      "-Command",
      options.command
    ],
    {
      cwd: options.cwd ?? runtime.defaultCwd,
      env: { ...process.env, ...options.env },
      windowsHide: true
    }
  );

  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    child.kill();
  }, timeoutMs);

  child.stdout?.on("data", (chunk: Buffer) => stdout.append(chunk));
  child.stderr?.on("data", (chunk: Buffer) => stderr.append(chunk));

  return await new Promise((resolve) => {
    child.on("error", (error) => {
      clearTimeout(timer);
      stderr.append(error.message);
      resolve({
        commandId,
        stdout: stdout.text(),
        stderr: stderr.text(),
        exitCode: 1,
        durationMs: Date.now() - started,
        truncated: stdout.truncated() || stderr.truncated()
      });
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (timedOut) {
        stderr.append(`Command timed out after ${timeoutMs}ms`);
      }

      resolve({
        commandId,
        stdout: stdout.text(),
        stderr: stderr.text(),
        exitCode: timedOut ? null : code,
        durationMs: Date.now() - started,
        truncated: stdout.truncated() || stderr.truncated()
      });
    });
  });
}
