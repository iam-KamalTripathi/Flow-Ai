import type { WorkflowDefinition } from "@FlowAi/workflow-core";

import { buildGraph } from "@FlowAi/workflow-validator";

import { ExecutionEngine } from "./src/engine/execution-engine.js";
import { ExecutorRegistry } from "./src/executors/executor-registry.js";

import type { ExecutionContext } from "./src/context/execution-context.js";

const workflow: WorkflowDefinition = {
  id: "workflow-1",
  name: "Manual HTTP Transform",
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
      id: "http-1",
      type: "action.http",
      position: {
        x: 300,
        y: 0,
      },
      config: {
        method: "GET",
        url: "https://jsonplaceholder.typicode.com/todos/1",
        headers: {},
        query: {},
      },
    },

    {
      id: "transform-1",
      type: "data.transform",
      position: {
        x: 600,
        y: 0,
      },
      config: {
        mappings: {
          httpStatus: "status",
        },
      },
    },
  ],

  edges: [
    {
      id: "edge-1",
      source: "trigger-1",
      sourceHandle: "main",
      target: "http-1",
      targetHandle: "main",
    },

    {
      id: "edge-2",
      source: "http-1",
      sourceHandle: "main",
      target: "transform-1",
      targetHandle: "main",
    },
  ],
};

const graph = buildGraph(workflow);

const registry = new ExecutorRegistry();

const context: ExecutionContext = {
  executionId: "execution-1",
  workflowId: workflow.id,
  status: "pending",
  currentNodeId: null,
  triggerInput: {
    message: "Start execution",
  },
  nodeOutputs: new Map<string, unknown>(),
  startedAt: new Date().toISOString(),
};

const engine = new ExecutionEngine(workflow, graph, registry);

const result = await engine.execute(context);

console.log("\n=== EXECUTION RESULT ===");
console.log("Status:", result.status);
console.log("Current node:", result.currentNodeId);
console.log("Error:", result.error);

console.log("\n=== NODE OUTPUTS ===");

for (const [nodeId, output] of result.nodeOutputs) {
  console.log(`${nodeId} =>`);
  console.dir(output, { depth: null });
}
