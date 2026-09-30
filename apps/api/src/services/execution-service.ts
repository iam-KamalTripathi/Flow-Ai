import type { WorkflowDefinition } from "@FlowAi/workflow-core";

import { ExecutionEngine, ExecutorRegistry } from "@FlowAi/workflow-engine";

import type { ExecutionContext } from "@FlowAi/workflow-engine";

import { buildGraph } from "@FlowAi/workflow-validator";

import { ExecutionRepository } from "../db/execution-repositry.js";
import { WorkflowRepository } from "../db/workflow-repository.js";

export interface ExecuteWorkflowInput {
  triggerInput: unknown;
}

export class ExecutionService {
  constructor(
    private readonly workflowRepository: WorkflowRepository,
    private readonly executionRepository: ExecutionRepository,
  ) {}

  async executeWorkflow(workflowId: string, input: ExecuteWorkflowInput) {
    // 1. Load workflow
    const savedWorkflow = await this.workflowRepository.findById(workflowId);

    if (!savedWorkflow) {
      throw new Error(`Workflow "${workflowId}" not found.`);
    }

    // 2. Restore workflow domain object
    const workflow = savedWorkflow.definition as unknown as WorkflowDefinition;

    // 3. Build execution graph
    const graph = buildGraph(workflow);

    // 4. Create executor registry
    const registry = new ExecutorRegistry();

    // 5. Create execution engine
    const engine = new ExecutionEngine(workflow, graph, registry);

    // 6. Create execution context
    const context: ExecutionContext = {
      executionId: crypto.randomUUID(),
      workflowId: workflow.id,
      status: "pending",
      currentNodeId: null,
      triggerInput: input.triggerInput,
      nodeOutputs: new Map<string, unknown>(),
      startedAt: new Date().toISOString(),
    };

    // 7. Persist initial execution
    await this.executionRepository.create({
      id: context.executionId,
      workflowId: context.workflowId,
      status: context.status,
      currentNodeId: context.currentNodeId,
      triggerInput: context.triggerInput,
      startedAt: context.startedAt,
    });

    try {
      // 8. Execute workflow
      const result = await engine.execute(context);

      // 9. Persist final state
      await this.executionRepository.updateFromContext(result);

      return result;
    } catch (error) {
      // 10. Persist failure if the engine itself throws
      context.status = "failed";

      await this.executionRepository.updateFromContext(context);

      throw error;
    }
  }

  async getExecution(executionId: string) {
    const execution = await this.executionRepository.findById(executionId);

    if (!execution) {
      throw new Error(`Execution "${executionId}" not found.`);
    }

    return execution;
  }

  async getWorkflowExecutions(workflowId: string) {
    const workflow = await this.workflowRepository.findById(workflowId);

    if (!workflow) {
      throw new Error(`Workflow "${workflowId}" not found.`);
    }

    return this.executionRepository.findByWorkflowId(workflowId);
  }
}
