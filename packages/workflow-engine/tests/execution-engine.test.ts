import { describe, expect, test } from "vitest";

import type { WorkflowDefinition } from "@FlowAi/workflow-core";

import { buildGraph } from "@FlowAi/workflow-validator";

import { ExecutionEngine, ExecutorRegistry } from "../src/index.js";

import type { ExecutionContext } from "../src/context/execution-context.js";

import { ExecutionError } from "../src/errors/execution-error.js";

import type { NodeExecutor } from "../src/executors/node-executor.js";

describe("ExecutionEngine", () => {
  // ==================================================
  // TEST 1
  // Linear workflow execution
  // ==================================================

  test("executes a linear workflow", async () => {
    const workflow: WorkflowDefinition = {
      id: "workflow-test-1",
      name: "Linear Test",
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
          id: "transform-1",
          type: "data.transform",
          position: {
            x: 300,
            y: 0,
          },
          config: {
            mappings: {
              message: "message",
            },
          },
        },
      ],

      edges: [
        {
          id: "edge-1",
          source: "trigger-1",
          sourceHandle: "main",
          target: "transform-1",
          targetHandle: "main",
        },
      ],
    };

    const graph = buildGraph(workflow);

    const registry = new ExecutorRegistry();

    const context: ExecutionContext = {
      executionId: "execution-test-1",
      workflowId: workflow.id,

      status: "pending",

      currentNodeId: null,

      triggerInput: {
        message: "Hello FlowAI",
      },

      nodeOutputs: new Map<string, unknown>(),

      startedAt: new Date().toISOString(),
    };

    const engine = new ExecutionEngine(workflow, graph, registry);

    const result = await engine.execute(context);

    expect(result.status).toBe("success");

    expect(result.currentNodeId).toBeNull();

    expect(result.error).toBeUndefined();

    expect(result.nodeOutputs.get("trigger-1")).toEqual({
      message: "Hello FlowAI",
    });

    expect(result.nodeOutputs.get("transform-1")).toEqual({
      message: "Hello FlowAI",
    });
  });

  // ==================================================
  // TEST 2
  // IF → TRUE branch
  // ==================================================

  test("routes the IF node through the true branch", async () => {
    const workflow: WorkflowDefinition = {
      id: "workflow-if-true",
      name: "IF True Test",
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
          id: "if-1",
          type: "logic.if",
          position: {
            x: 300,
            y: 0,
          },
          config: {
            conditions: [
              {
                field: "status",
                operator: "equals",
                value: 200,
              },
            ],
            combinator: "AND",
          },
        },

        {
          id: "true-node",
          type: "data.transform",
          position: {
            x: 600,
            y: -100,
          },
          config: {
            mappings: {
              message: "message",
            },
          },
        },

        {
          id: "false-node",
          type: "data.transform",
          position: {
            x: 600,
            y: 100,
          },
          config: {
            mappings: {
              message: "message",
            },
          },
        },
      ],

      edges: [
        {
          id: "edge-trigger-if",
          source: "trigger-1",
          sourceHandle: "main",
          target: "if-1",
          targetHandle: "main",
        },

        {
          id: "edge-if-true",
          source: "if-1",
          sourceHandle: "true",
          target: "true-node",
          targetHandle: "main",
        },

        {
          id: "edge-if-false",
          source: "if-1",
          sourceHandle: "false",
          target: "false-node",
          targetHandle: "main",
        },
      ],
    };

    const graph = buildGraph(workflow);

    const registry = new ExecutorRegistry();

    const context: ExecutionContext = {
      executionId: "execution-if-true",
      workflowId: workflow.id,

      status: "pending",

      currentNodeId: null,

      triggerInput: {
        status: 200,
        message: "TRUE",
      },

      nodeOutputs: new Map<string, unknown>(),

      startedAt: new Date().toISOString(),
    };

    const engine = new ExecutionEngine(workflow, graph, registry);

    const result = await engine.execute(context);

    expect(result.status).toBe("success");

    expect(result.nodeOutputs.has("true-node")).toBe(true);

    expect(result.nodeOutputs.has("false-node")).toBe(false);

    expect(result.nodeOutputs.get("true-node")).toEqual({
      message: "TRUE",
    });
  });

  // ==================================================
  // TEST 3
  // IF → FALSE branch
  // ==================================================

  test("routes the IF node through the false branch", async () => {
    const workflow: WorkflowDefinition = {
      id: "workflow-if-false",
      name: "IF False Test",
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
          id: "if-1",
          type: "logic.if",
          position: {
            x: 300,
            y: 0,
          },
          config: {
            conditions: [
              {
                field: "status",
                operator: "equals",
                value: 200,
              },
            ],
            combinator: "AND",
          },
        },

        {
          id: "true-node",
          type: "data.transform",
          position: {
            x: 600,
            y: -100,
          },
          config: {
            mappings: {
              message: "message",
            },
          },
        },

        {
          id: "false-node",
          type: "data.transform",
          position: {
            x: 600,
            y: 100,
          },
          config: {
            mappings: {
              message: "message",
            },
          },
        },
      ],

      edges: [
        {
          id: "edge-trigger-if",
          source: "trigger-1",
          sourceHandle: "main",
          target: "if-1",
          targetHandle: "main",
        },

        {
          id: "edge-if-true",
          source: "if-1",
          sourceHandle: "true",
          target: "true-node",
          targetHandle: "main",
        },

        {
          id: "edge-if-false",
          source: "if-1",
          sourceHandle: "false",
          target: "false-node",
          targetHandle: "main",
        },
      ],
    };

    const graph = buildGraph(workflow);

    const registry = new ExecutorRegistry();

    const context: ExecutionContext = {
      executionId: "execution-if-false",
      workflowId: workflow.id,

      status: "pending",

      currentNodeId: null,

      triggerInput: {
        status: 404,
        message: "FALSE",
      },

      nodeOutputs: new Map<string, unknown>(),

      startedAt: new Date().toISOString(),
    };

    const engine = new ExecutionEngine(workflow, graph, registry);

    const result = await engine.execute(context);

    expect(result.status).toBe("success");

    expect(result.nodeOutputs.has("true-node")).toBe(false);

    expect(result.nodeOutputs.has("false-node")).toBe(true);

    expect(result.nodeOutputs.get("false-node")).toEqual({
      message: "FALSE",
    });
  });

  // ==================================================
  // TEST 4
  // Retryable error
  // ==================================================

  test("retries a retryable error and eventually succeeds", async () => {
    let attempts = 0;

    const workflow: WorkflowDefinition = {
      id: "workflow-retryable",
      name: "Retryable Error Test",
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
          id: "retry-node",
          type: "test.retry",
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
          target: "retry-node",
          targetHandle: "main",
        },
      ],
    };

    const retryExecutor: NodeExecutor = {
      async execute() {
        attempts += 1;

        if (attempts < 3) {
          throw new ExecutionError(
            `Temporary failure on attempt ${attempts}`,
            true,
          );
        }

        return {
          output: {
            success: true,
            attempts,
          },

          outputHandle: "main",
        };
      },
    };

    const graph = buildGraph(workflow);

    const registry = new ExecutorRegistry();

    registry.register("test.retry", retryExecutor);

    const context: ExecutionContext = {
      executionId: "execution-retryable",
      workflowId: workflow.id,

      status: "pending",

      currentNodeId: null,

      triggerInput: {
        message: "Retry test",
      },

      nodeOutputs: new Map<string, unknown>(),

      startedAt: new Date().toISOString(),
    };

    const engine = new ExecutionEngine(workflow, graph, registry, {
      maxRetries: 2,
    });

    const result = await engine.execute(context);

    expect(attempts).toBe(3);

    expect(result.status).toBe("success");

    expect(result.error).toBeUndefined();

    expect(result.nodeOutputs.get("retry-node")).toEqual({
      success: true,
      attempts: 3,
    });
  });

  // ==================================================
  // TEST 5
  // Non-retryable error
  // ==================================================

  test("does not retry a non-retryable error", async () => {
    let attempts = 0;

    const workflow: WorkflowDefinition = {
      id: "workflow-non-retryable",
      name: "Non Retryable Error Test",
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
          id: "failure-node",
          type: "test.failure",
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
          target: "failure-node",
          targetHandle: "main",
        },
      ],
    };

    const failureExecutor: NodeExecutor = {
      async execute() {
        attempts += 1;

        throw new ExecutionError("Permanent failure", false);
      },
    };

    const graph = buildGraph(workflow);

    const registry = new ExecutorRegistry();

    registry.register("test.failure", failureExecutor);

    const context: ExecutionContext = {
      executionId: "execution-non-retryable",
      workflowId: workflow.id,

      status: "pending",

      currentNodeId: null,

      triggerInput: {
        message: "Non retryable test",
      },

      nodeOutputs: new Map<string, unknown>(),

      startedAt: new Date().toISOString(),
    };

    const engine = new ExecutionEngine(workflow, graph, registry, {
      maxRetries: 2,
    });

    const result = await engine.execute(context);

    expect(attempts).toBe(1);

    expect(result.status).toBe("failed");

    expect(result.error).toEqual({
      nodeId: "failure-node",
      message: "Permanent failure",
      retryable: false,
    });
  });
});
