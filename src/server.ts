import { pathToFileURL } from "node:url";
import { loadConfig } from "./config.js";
import { createPendragonApp } from "./mcpServer.js";

export async function main(): Promise<void> {
  const config = loadConfig();
  const { app, sessions } = createPendragonApp(config);

  const httpServer = app.listen(config.port, config.host, () => {
    console.log(`Pendragon MCP listening at http://${config.host}:${config.port}${config.endpointPath}`);
  });

  const shutdown = () => {
    sessions.closeAll();
    httpServer.close(() => process.exit(0));
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
