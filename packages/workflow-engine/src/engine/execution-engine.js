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
        const startNode = this.findStartNode();
        if (!startNode) {
            context.status = "failed";
            throw new Error("Workflow does not contain a trigger node.");
        }
        let currentNode = startNode;
        try {
            while (true) {
                context.currentNodeId = currentNode.id;
                const input = this.getNodeInput(currentNode, context);
                const result = await this.executeWithRetry(currentNode, input, context);
                context.nodeOutputs.set(currentNode.id, result.output);
                const nextNode = this.findNextNode(currentNode, result.outputHandle);
                if (!nextNode) {
                    break;
                }
                currentNode = nextNode;
            }
            context.currentNodeId = null;
            context.status = "success";
            return context;
        }
        catch (error) {
            context.status = "failed";
            context.error = {
                nodeId: currentNode.id,
                message: error instanceof Error ? error.message : String(error),
                retryable: error instanceof ExecutionError ? error.retryable : false,
            };
            return context;
        }
    }
    findStartNode() {
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
