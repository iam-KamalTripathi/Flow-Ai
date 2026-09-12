import type { WorkflowNode } from "@FlowAi/workflow-core";

import type { ExecutionContext } from "./src/context/execution-context.js";

import type { NodeExecutor } from "./src/executors/node-executor.js";

import { ExecutorRegistry } from "./src/executors/executor-registry.js";

import { ExecutionEngine } from "./src/engine/execution-engine.js";

import { buildGraph } from "@FlowAi/workflow-validator";

class FlakyExecutor implements NodeExecutor {
  private attempts = 0;

  async execute(
    node: WorkflowNode,
    _input: unknown,
    _context: ExecutionContext,
  ): Promise<unknown> {
    this.attempts += 1;

    console.log(`Attempt ${this.attempts}`);

    if (this.attempts < 3) {
      throw new Error(`Temporary failure on attempt ${this.attempts}`);
    }

    return {
      success: true,
      attempts: this.attempts,
    };
  }
}

const workflow = {
  id: "retry-workflow",
  name: "Retry Test",
  version: 1,

  nodes: [
    {
      id: "trigger-1",
      type: "trigger.manual",
      position: {
        x: 0,
        y: 0,
      },
      config: {},
    },

    {
      id: "flaky-1",
      type: "test.flaky",
      position: {
        x: 300,
        y: 0,
      },
      config: {},
    },
  ],

  edges: [
    {
      id: "edge-1",
      source: "trigger-1",
      sourceHandle: "main",
      target: "flaky-1",
      targetHandle: "main",
    },
  ],
};

const graph = buildGraph(workflow);

const registry = new ExecutorRegistry();

registry.register("test.flaky", new FlakyExecutor());

const context: ExecutionContext = {
  executionId: "retry-test-1",
  workflowId: workflow.id,
  status: "pending",
  currentNodeId: null,
  triggerInput: {
    message: "test",
  },
  nodeOutputs: new Map<string, unknown>(),
  startedAt: new Date().toISOString(),
};

const engine = new ExecutionEngine(workflow, graph, registry, {
  maxRetries: 2,
});

const result = await engine.execute(context);

console.log("\nStatus:", result.status);

console.log("Outputs:", result.nodeOutputs);

console.log("Error:", result.error);
// tesing completed
