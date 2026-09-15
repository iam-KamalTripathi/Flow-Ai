import type { WorkflowNode } from "@FlowAi/workflow-core";
import type { TransformConfig } from "@FlowAi/node-definitions";
import type { ExecutionContext } from "../context/execution-context.js";
import type { NodeExecutor } from "./node-executor.js";
export declare class TransformExecutor implements NodeExecutor {
    execute(node: WorkflowNode<TransformConfig>, input: unknown, _context: ExecutionContext): Promise<{
        output: Record<string, unknown>;
        outputHandle: string;
    }>;
}
//# sourceMappingURL=transform-executor.d.ts.map