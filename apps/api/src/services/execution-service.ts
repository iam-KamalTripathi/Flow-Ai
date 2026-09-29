import type { WorkflowDefinition } from "@FlowAi/workflow-core";
import { buildGraph } from "@FlowAi/workflow-validator";

import { ExecutionEngine, ExecutorRegistry } from "@FlowAi/workflow-engine/src";
import { WorkflowRepository } from "../db/workflow-repository";

interface ExecutionWorkflowInput {
  triggerInput: unknown;
}

export class ExecutionService {
  constructor(private readonly workflowRepository: WorkflowRepository) {}

  async executeWorkflow(workflowId: string, input: ExecutionWorkflowInput) {
    const savedWorkflow = await this.workflowRepository.findById(workflowId);

    if (!savedWorkflow) {
      throw new Error("Workflow not found.");
    }

    const workflow = savedWorkflow.definition as unknown as WorkflowDefinition;
    const graph = buildGraph(workflow);

    const registry = new ExecutorRegistry();

    const engine = new ExecutionEngine(workflow, graph, registry);

    const context = {
      executionId: crypto.randomUUID(),
      workflowId: workflow.id,
      status: "pending" as const,
      currentNodeId: null,
      triggerInput: input.triggerInput,
      nodeOutputs: new Map<string, unknown>(),
      startedAt: new Date().toISOString(),
    };

    const result = await engine.execute(context);
    return result;
  }
}
