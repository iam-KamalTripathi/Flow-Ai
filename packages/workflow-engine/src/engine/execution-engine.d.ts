import type { WorkflowDefinition } from "@FlowAi/workflow-core";
import type { WorkflowGraph } from "@FlowAi/workflow-validator";
import type { ExecutionContext } from "../context/execution-context.js";
import { ExecutorRegistry } from "../executors/executor-registry.js";
export type EngineTelemetryEvent = {
    type: "execution.started";
    executionId: string;
    workflowId: string;
    timestamp: string;
} | {
    type: "node.started";
    executionId: string;
    workflowId: string;
    nodeId: string;
    nodeType: string;
    timestamp: string;
} | {
    type: "node.succeeded";
    executionId: string;
    workflowId: string;
    nodeId: string;
    nodeType: string;
    outputHandle: string;
    timestamp: string;
} | {
    type: "node.failed";
    executionId: string;
    workflowId: string;
    nodeId: string;
    nodeType: string;
    message: string;
    timestamp: string;
} | {
    type: "execution.succeeded";
    executionId: string;
    workflowId: string;
    timestamp: string;
} | {
    type: "execution.failed";
    executionId: string;
    workflowId: string;
    nodeId: string | null;
    message: string;
    timestamp: string;
};
export interface ExecutionEngineOptions {
    maxRetries?: number;
    onEvent?: (event: EngineTelemetryEvent) => void;
}
export declare class ExecutionEngine {
    private readonly workflow;
    private readonly graph;
    private readonly registry;
    private readonly options;
    constructor(workflow: WorkflowDefinition, graph: WorkflowGraph, registry: ExecutorRegistry, options?: ExecutionEngineOptions);
    execute(context: ExecutionContext): Promise<ExecutionContext>;
    private emitTelemetry;
    private findStartNode;
    private getNodeInput;
    private findNextNode;
    private executeWithRetry;
}
//# sourceMappingURL=execution-engine.d.ts.map