import type { WorkflowDefinition, WorkflowNode } from "@FlowAi/workflow-core";

import type { WorkflowGraph } from "@FlowAi/workflow-validator";

import type { ExecutionContext } from "../context/execution-context.js";

import { ExecutorRegistry } from "../executors/executor-registry.js";
import { ExecutionError } from "../errors/execution-error.js";
import { NodeExecutionResult } from "../executors/node-executor.js";

export type EngineTelemetryEvent =
  | {
      type: "execution.started";
      executionId: string;
      workflowId: string;
      timestamp: string;
    }
  | {
      type: "node.started";
      executionId: string;
      workflowId: string;
      nodeId: string;
      nodeType: string;
      timestamp: string;
    }
  | {
      type: "node.succeeded";
      executionId: string;
      workflowId: string;
      nodeId: string;
      nodeType: string;
      outputHandle: string;
      timestamp: string;
    }
  | {
      type: "node.failed";
      executionId: string;
      workflowId: string;
      nodeId: string;
      nodeType: string;
      message: string;
      timestamp: string;
    }
  | {
      type: "execution.succeeded";
      executionId: string;
      workflowId: string;
      timestamp: string;
    }
  | {
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

export class ExecutionEngine {
  constructor(
    private readonly workflow: WorkflowDefinition,
    private readonly graph: WorkflowGraph,
    private readonly registry: ExecutorRegistry,
    private readonly options: ExecutionEngineOptions = {},
  ) {}

  async execute(context: ExecutionContext): Promise<ExecutionContext> {
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

    let currentNode: WorkflowNode = startNode;

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

        let result: NodeExecutionResult;

        try {
          result = await this.executeWithRetry(currentNode, input, context);
        } catch (error) {
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
    } catch (error) {
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

  private emitTelemetry(event: EngineTelemetryEvent): void {
    try {
      this.options.onEvent?.(event);
    } catch (error) {
      console.error("[FlowAI telemetry] Event callback failed:", error);
    }
  }

  private findStartNode(context: ExecutionContext): WorkflowNode | undefined {
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

  private findNextNode(
    node: WorkflowNode,
    outputHandle: string,
  ): WorkflowNode | undefined {
    const outgoing = this.graph.outgoingEdges.get(node.id) ?? [];

    const edge = outgoing.find((edge) => edge.sourceHandle === outputHandle);

    if (!edge) {
      return undefined;
    }

    return this.graph.nodes.get(edge.target);
  }

  private async executeWithRetry(
    currentNode: WorkflowNode,
    input: unknown,
    context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
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
