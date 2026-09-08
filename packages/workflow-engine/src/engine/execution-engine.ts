import type { WorkflowDefinition, WorkflowNode } from "@FlowAi/workflow-core";

import type { WorkflowGraph } from "@FlowAi/workflow-validator";

import type { ExecutionContext } from "../context/execution-context.js";

import { ExecutorRegistory } from "../executors/executor-registry.js";

export class ExecutionEngine {
  constructor(
    private readonly workflow: WorkflowDefinition,
    private readonly graph: WorkflowGraph,
    private readonly registry: ExecutorRegistory,
  ) {}

  async execute(context: ExecutionContext): Promise<ExecutionContext> {
    context.status = "running";

    const startNode = this.findStartNode();

    if (!startNode) {
      context.status = "failed";
      throw new Error("Workflow does not contain a trigger node.");
    }

    let currentNode: WorkflowNode = startNode;

    while (true) {
      context.currentNodeId = currentNode.id;

      const executor = this.registry.get(currentNode.type);
      const input = this.getNodeInput(currentNode, context);
      const output = await executor.execute(currentNode, input, context);

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
}
