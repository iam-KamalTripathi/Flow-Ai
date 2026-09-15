import type { WorkflowNode } from "@FlowAi/workflow-core";
import type { IfConfig } from "@FlowAi/node-definitions";
import type { ExecutionContext } from "../context/execution-context.js";
import type { NodeExecutionResult, NodeExecutor } from "./node-executor.js";
export declare class IfExecutor implements NodeExecutor {
    execute(node: WorkflowNode<IfConfig>, input: unknown, _context: ExecutionContext): Promise<NodeExecutionResult>;
    private evaluateCondition;
    private getFieldValue;
}
//# sourceMappingURL=if-executors.d.ts.map