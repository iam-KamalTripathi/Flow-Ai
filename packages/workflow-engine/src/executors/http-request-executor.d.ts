import type { WorkflowNode } from "@FlowAi/workflow-core";
import type { ExecutionContext } from "../context/execution-context.js";
import type { NodeExecutor } from "./node-executor.js";
export declare class HttpRequestExecutor implements NodeExecutor {
    execute(node: WorkflowNode, input: unknown, context: ExecutionContext): Promise<{
        output: {
            status: number;
            data: any;
        };
        outputHandle: string;
    }>;
}
//# sourceMappingURL=http-request-executor.d.ts.map