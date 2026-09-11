import type { WorkflowDefinition, WorkflowNode } from "@FlowAi/workflow-core";

import type { WorkflowGraph } from "@FlowAi/workflow-validator";

import type { ExecutionContext } from "../context/execution-context.js";

import { ExecutorRegistry } from "../executors/executor-registry.js";
import { ExecutionError } from "../errors/execution-error.js";

interface ExecutionOptions {
  maxRetries?: number;
}

export class ExecutionEngine {
  constructor(
    private readonly workflow: WorkflowDefinition,
    private readonly graph: WorkflowGraph,
    private readonly registry: ExecutorRegistry,
    private readonly options: ExecutionOptions = {},
  ) {}

  async execute(context: ExecutionContext): Promise<ExecutionContext> {
    context.status = "running";

    const startNode = this.findStartNode();

    if (!startNode) {
      context.status = "failed";

      throw new Error("Workflow does not contain a trigger node.");
    }

    let currentNode: WorkflowNode = startNode;

    try {
      while (true) {
        context.currentNodeId = currentNode.id;

        const input = this.getNodeInput(currentNode, context);

        const output = await this.executeWithRetry(currentNode, input, context);

        context.nodeOutputs.set(currentNode.id, output);

        const nextNode = this.findNextNode(currentNode);

        if (!nextNode) {
          break;
        }

        currentNode = nextNode;
      }

      context.currentNodeId = null;
      context.status = "success";

      return context;
    } catch (error) {
      context.status = "failed";

      context.error = {
        nodeId: currentNode.id,
        message: error instanceof Error ? error.message : String(error),
        retryable: error instanceof ExecutionError ? error.retryable : false,
      };

      return context;
    }
  }

  private findStartNode(): WorkflowNode | undefined {
    return this.workflow.nodes.find((node) => {
      const incoming = this.graph.incomingEdges.get(node.id) ?? [];

      return incoming.length === 0 && node.type.startsWith("trigger.");
    });
  }

  private getNodeInput(node: WorkflowNode, context: ExecutionContext): unknown {
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

  private findNextNode(node: WorkflowNode): WorkflowNode | undefined {
    const outgoing = this.graph.outgoingEdges.get(node.id) ?? [];

    const nextNodeId = outgoing[0]?.target;

    if (!nextNodeId) {
      return undefined;
    }

    return this.graph.nodes.get(nextNodeId);
  }

  private async executeWithRetry(
    currentNode: WorkflowNode,
    input: unknown,
    context: ExecutionContext,
  ): Promise<unknown> {
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
      } catch (error) {
        const retryable =
          error instanceof ExecutionError ? error.retryable : false;
        if (!retryable || attempts > maxRetries) {
          delete context.retryState;
          throw error;
        }
      }
    }
  }
}
