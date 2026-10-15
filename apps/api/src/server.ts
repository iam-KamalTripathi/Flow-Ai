import "dotenv/config";

import { createServer } from "node:http";

import { app } from "./app.js";
import { createTelemetryGateway } from "./telemetry/telemetry-gateway.js";

const PORT = Number(process.env.PORT ?? 4000);

const httpServer = createServer(app);

async function startServer(): Promise<void> {
  const gateway = await createTelemetryGateway(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`FlowAI API running on http://localhost:${PORT}`);
    console.log("Socket.IO telemetry gateway is ready.");
  });

  async function shutdown(signal: string): Promise<void> {
    console.log(`Received ${signal}. Shutting down API...`);

    try {
      await gateway.close();
      console.log("FlowAI API shut down cleanly.");
    } catch (error) {
      console.error("API shutdown failed:", error);
      process.exitCode = 1;
    }
  }

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });
}

void startServer().catch((error: unknown) => {
  console.error("Failed to start FlowAI API:", error);
  process.exitCode = 1;
});
