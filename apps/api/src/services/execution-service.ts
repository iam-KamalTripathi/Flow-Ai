import type { WorkflowDefinition } from "@FlowAi/workflow-core";

import {
  ExecutionEngine,
  ExecutorRegistry,
  createExecutionSnapshot,
} from "@FlowAi/workflow-engine";

import type {
  ExecutionContext,
  ExecutionSnapshot,
} from "@FlowAi/workflow-engine";

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
      const result = await engine.execute(context);

      if (result.status === "failed") {
        const snapshot = createExecutionSnapshot(result);

        await this.executionRepository.saveSnapshot(
          result.executionId,
          snapshot,
        );
      }

      await this.executionRepository.updateFromContext(result);

      return result;
    } catch (error) {
      context.status = "failed";

      const snapshot = createExecutionSnapshot(context);

      await this.executionRepository.saveSnapshot(
        context.executionId,
        snapshot,
      );

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

  async resumeExecution(executionId: string) {
    // 1. Load the failed execution
    const execution = await this.executionRepository.findById(executionId);

    if (!execution) {
      throw new Error(`Execution "${executionId}" not found.`);
    }

    // 2. Only failed executions can be resumed
    if (execution.status !== "failed") {
      throw new Error(
        `Execution "${executionId}" is not failed and cannot be resumed.`,
      );
    }

    // 3. A failed execution must have a snapshot
    if (execution.snapshot === null) {
      throw new Error(
        `Execution "${executionId}" does not have a recovery snapshot.`,
      );
    }

    // 4. Restore the snapshot
    const snapshot = execution.snapshot as unknown as ExecutionSnapshot;

    // 5. Get the current workflow definition
    const workflow = execution.workflow
      .definition as unknown as WorkflowDefinition;

    // 6. Rebuild the graph
    const graph = buildGraph(workflow);

    // 7. Create executors
    const registry = new ExecutorRegistry();

    // 8. Create execution engine
    const engine = new ExecutionEngine(workflow, graph, registry);

    // 9. Restore runtime execution context
    const context: ExecutionContext = {
      executionId: execution.id,
      workflowId: execution.workflowId,
      status: "pending",
      currentNodeId: snapshot.currentNodeId,
      triggerInput: snapshot.triggerInput,
      nodeOutputs: new Map(Object.entries(snapshot.nodeOutputs)),
      startedAt: execution.startedAt.toISOString(),
    };

    // 10. Mark execution as ready for resume
    if (snapshot.currentNodeId === null) {
      throw new Error(
        `Execution "${executionId}" does not have a resume node.`,
      );
    }

    await this.executionRepository.prepareForResume(
      execution.id,
      snapshot.currentNodeId,
    );

    try {
      // 11. Continue execution from snapshot.currentNodeId
      const result = await engine.execute(context);

      // 12. If it fails again, save the new recovery state
      if (result.status === "failed") {
        const newSnapshot = createExecutionSnapshot(result);

        await this.executionRepository.saveSnapshot(
          result.executionId,
          newSnapshot,
        );
      }

      // 13. Persist final state
      await this.executionRepository.updateFromContext(result);

      return result;
    } catch (error) {
      // 14. Handle unexpected engine failures
      context.status = "failed";

      const newSnapshot = createExecutionSnapshot(context);

      await this.executionRepository.saveSnapshot(
        context.executionId,
        newSnapshot,
      );

      await this.executionRepository.updateFromContext(context);

      throw error;
    }
  }
}
