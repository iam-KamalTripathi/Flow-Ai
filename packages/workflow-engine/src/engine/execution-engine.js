import { ExecutionError } from "../errors/execution-error.js";
export class ExecutionEngine {
    workflow;
    graph;
    registry;
    options;
    constructor(workflow, graph, registry, options = {}) {
        this.workflow = workflow;
        this.graph = graph;
        this.registry = registry;
        this.options = options;
    }
    async execute(context) {
        context.status = "running";
        this.emitTelemetry({
            type: "execution.started",
            executionId: context.executionId,
            workflowId: context.workflowId,
            timestamp: new Date().toISOString(),
        });
        const startNode = this.findStartNode(context);
        if (!startNode) {
            context.status = "failed";
            const message = "Workflow does not contain a trigger node.";
            this.emitTelemetry({
                type: "execution.failed",
                executionId: context.executionId,
                workflowId: context.workflowId,
                nodeId: null,
                message,
                timestamp: new Date().toISOString(),
            });
            throw new Error(message);
        }
        let currentNode = startNode;
        try {
            while (true) {
                context.currentNodeId = currentNode.id;
                this.emitTelemetry({
                    type: "node.started",
                    executionId: context.executionId,
                    workflowId: context.workflowId,
                    nodeId: currentNode.id,
                    nodeType: currentNode.type,
                    timestamp: new Date().toISOString(),
                });
                const input = this.getNodeInput(currentNode, context);
                let result;
                try {
                    result = await this.executeWithRetry(currentNode, input, context);
                }
                catch (error) {
                    this.emitTelemetry({
                        type: "node.failed",
                        executionId: context.executionId,
                        workflowId: context.workflowId,
                        nodeId: currentNode.id,
                        nodeType: currentNode.type,
                        message: error instanceof Error ? error.message : String(error),
                        timestamp: new Date().toISOString(),
                    });
                    throw error;
                }
                context.nodeOutputs.set(currentNode.id, result.output);
                this.emitTelemetry({
                    type: "node.succeeded",
                    executionId: context.executionId,
                    workflowId: context.workflowId,
                    nodeId: currentNode.id,
                    nodeType: currentNode.type,
                    outputHandle: result.outputHandle,
                    timestamp: new Date().toISOString(),
                });
                const nextNode = this.findNextNode(currentNode, result.outputHandle);
                if (!nextNode) {
                    break;
                }
                currentNode = nextNode;
            }
            context.currentNodeId = null;
            context.status = "success";
            this.emitTelemetry({
                type: "execution.succeeded",
                executionId: context.executionId,
                workflowId: context.workflowId,
                timestamp: new Date().toISOString(),
            });
            return context;
        }
        catch (error) {
            context.status = "failed";
            context.error = {
                nodeId: currentNode.id,
                message: error instanceof Error ? error.message : String(error),
                retryable: error instanceof ExecutionError ? error.retryable : false,
            };
            this.emitTelemetry({
                type: "execution.failed",
                executionId: context.executionId,
                workflowId: context.workflowId,
                nodeId: currentNode.id,
                message: context.error.message,
                timestamp: new Date().toISOString(),
            });
            return context;
        }
    }
    emitTelemetry(event) {
        try {
            this.options.onEvent?.(event);
        }
        catch (error) {
            console.error("[FlowAI telemetry] Event callback failed:", error);
        }
    }
    findStartNode(context) {
        // Resume execution from the node stored in the snapshot.
        if (context.currentNodeId !== null) {
            return this.graph.nodes.get(context.currentNodeId);
        }
        // Normal execution starts from the trigger.
        return this.workflow.nodes.find((node) => {
            const incoming = this.graph.incomingEdges.get(node.id) ?? [];
            return incoming.length === 0 && node.type.startsWith("trigger.");
        });
    }
    getNodeInput(node, context) {
        const incoming = this.graph.incomingEdges.get(node.id) ?? [];
        if (incoming.length === 0) {
            return context.triggerInput;
        }
        const previousNodeId = incoming[0]?.source;
        if (!previousNodeId) {
            return undefined;
        }
        return context.nodeOutputs.get(previousNodeId);
    }
    findNextNode(node, outputHandle) {
        const outgoing = this.graph.outgoingEdges.get(node.id) ?? [];
        const edge = outgoing.find((edge) => edge.sourceHandle === outputHandle);
        if (!edge) {
            return undefined;
        }
        return this.graph.nodes.get(edge.target);
    }
    async executeWithRetry(currentNode, input, context) {
        const executor = this.registry.get(currentNode.type);
        const maxRetries = this.options.maxRetries ?? 0;
        let attempts = 0;
        while (true) {
            attempts += 1;
            context.retryState = {
                attempts,
                maxAttempts: maxRetries + 1,
            };
            try {
                const output = await executor.execute(currentNode, input, context);
                delete context.retryState;
                return output;
            }
            catch (error) {
                const retryable = error instanceof ExecutionError ? error.retryable : false;
                if (!retryable || attempts > maxRetries) {
                    delete context.retryState;
                    throw error;
                }
            }
        }
    }
}
