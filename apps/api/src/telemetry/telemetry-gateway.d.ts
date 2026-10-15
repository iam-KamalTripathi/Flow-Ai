import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
export declare function createTelemetryGateway(httpServer: HttpServer): Promise<{
    io: Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
    close(): Promise<void>;
}>;
//# sourceMappingURL=telemetry-gateway.d.ts.map