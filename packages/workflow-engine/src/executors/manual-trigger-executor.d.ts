import type { WorkflowNode } from "@FlowAi/workflow-core";
import type { ExecutionContext } from "../context/execution-context.js";
import type { NodeExecutor } from "./node-executor.js";
export declare class ManualTriggerExecutor implements NodeExecutor {
    execute(_node: WorkflowNode, input: unknown, _context: ExecutionContext): Promise<{
        output: unknown;
        outputHandle: string;
    }>;
}
//# sourceMappingURL=manual-trigger-executor.d.ts.map