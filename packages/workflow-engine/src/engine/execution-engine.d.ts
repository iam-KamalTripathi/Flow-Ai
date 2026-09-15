import type { WorkflowDefinition } from "@FlowAi/workflow-core";
import type { WorkflowGraph } from "@FlowAi/workflow-validator";
import type { ExecutionContext } from "../context/execution-context.js";
import { ExecutorRegistry } from "../executors/executor-registry.js";
interface ExecutionOptions {
    maxRetries?: number;
}
export declare class ExecutionEngine {
    private readonly workflow;
    private readonly graph;
    private readonly registry;
    private readonly options;
    constructor(workflow: WorkflowDefinition, graph: WorkflowGraph, registry: ExecutorRegistry, options?: ExecutionOptions);
    execute(context: ExecutionContext): Promise<ExecutionContext>;
    private findStartNode;
    private getNodeInput;
    private findNextNode;
    private executeWithRetry;
}
export {};
//# sourceMappingURL=execution-engine.d.ts.map