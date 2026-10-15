import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import Redis from "ioredis";

import type { EngineTelemetryEvent } from "@FlowAi/workflow-engine";

const TELEMETRY_CHANNEL = "flowai:execution:telemetry";

const executionRoom = (executionId: string) => `execution:${executionId}`;

const workflowRoom = (workflowId: string) => `workflow:${workflowId}`;

function isRoomId(value: unknown): value is string {
  return (
    typeof value === "string" && value.trim().length > 0 && value.length <= 200
  );
}

function isTelemetryEvent(value: unknown): value is EngineTelemetryEvent {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const event = value as Record<string, unknown>;

  if (
    typeof event.executionId !== "string" ||
    typeof event.workflowId !== "string" ||
    typeof event.timestamp !== "string"
  ) {
    return false;
  }

  switch (event.type) {
    case "execution.started":
    case "execution.succeeded":
      return true;

    case "node.started":
      return (
        typeof event.nodeId === "string" && typeof event.nodeType === "string"
      );

    case "node.succeeded":
      return (
        typeof event.nodeId === "string" &&
        typeof event.nodeType === "string" &&
        typeof event.outputHandle === "string"
      );

    case "node.failed":
      return (
        typeof event.nodeId === "string" &&
        typeof event.nodeType === "string" &&
        typeof event.message === "string"
      );

    case "execution.failed":
      return (
        (event.nodeId === null || typeof event.nodeId === "string") &&
        typeof event.message === "string"
      );

    default:
      return false;
  }
}

export async function createTelemetryGateway(httpServer: HttpServer) {
  // Attach Socket.IO to the same HTTP server as Express.
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.WEB_ORIGIN ?? "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  // Use a dedicated Redis connection for subscriptions.
  const subscriber = new Redis({
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
  });

  subscriber.on("error", (error: Error) => {
    console.error("[Telemetry Gateway] Redis error:", error);
  });

  // Receive messages published by the workflow worker.
  subscriber.on("message", (channel, message) => {
    if (channel !== TELEMETRY_CHANNEL) {
      return;
    }

    let parsed: unknown;

    try {
      parsed = JSON.parse(message) as unknown;
    } catch (error) {
      console.error("[Telemetry Gateway] Invalid JSON message:", error);
      return;
    }

    if (!isTelemetryEvent(parsed)) {
      console.error("[Telemetry Gateway] Invalid telemetry event received.");
      return;
    }

    const event = parsed;

    console.log("[Telemetry Gateway] Forwarding:", {
      type: event.type,
      executionId: event.executionId,
    });

    // Send to clients watching this execution or its workflow.
    io.to(executionRoom(event.executionId))
      .to(workflowRoom(event.workflowId))
      .emit("execution:event", event);
  });

  io.on("connection", (socket) => {
    console.log("[Socket.IO] Client connected:", socket.id);

    // Subscribe to a specific execution.
    socket.on("execution:subscribe", async (executionId: unknown) => {
      if (!isRoomId(executionId)) {
        socket.emit("execution:subscription_error", {
          message: "Invalid execution ID.",
        });
        return;
      }

      await socket.join(executionRoom(executionId));

      socket.emit("execution:subscribed", { executionId });
    });

    socket.on("execution:unsubscribe", async (executionId: unknown) => {
      if (!isRoomId(executionId)) {
        return;
      }

      await socket.leave(executionRoom(executionId));
    });

    // Subscribe before starting an execution so fast workflows
    // don't finish before the client begins listening.
    socket.on("workflow:subscribe", async (workflowId: unknown) => {
      if (!isRoomId(workflowId)) {
        socket.emit("workflow:subscription_error", {
          message: "Invalid workflow ID.",
        });
        return;
      }

      await socket.join(workflowRoom(workflowId));

      socket.emit("workflow:subscribed", { workflowId });
    });

    socket.on("workflow:unsubscribe", async (workflowId: unknown) => {
      if (!isRoomId(workflowId)) {
        return;
      }

      await socket.leave(workflowRoom(workflowId));
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket.IO] Client disconnected:", {
        socketId: socket.id,
        reason,
      });
    });
  });

  // Subscribe before allowing the API server to accept requests.
  try {
    await subscriber.subscribe(TELEMETRY_CHANNEL);

    console.log(`[Telemetry Gateway] Subscribed to "${TELEMETRY_CHANNEL}".`);
  } catch (error) {
    subscriber.disconnect();
    await new Promise<void>((resolve) => {
      io.close(() => resolve());
    });

    throw error;
  }

  return {
    io,

    async close(): Promise<void> {
      await new Promise<void>((resolve) => {
        io.close(() => resolve());
      });

      await subscriber.quit();
    },
  };
}
