import type { WorkflowDefinition, WorkflowNode } from "@FlowAi/workflow-core";

import { buildGraph } from "@FlowAi/workflow-validator";

import { ExecutionEngine } from "./src/engine/execution-engine.js";
import { ExecutorRegistry } from "./src/executors/executor-registry.js";

import type { ExecutionContext } from "./src/context/execution-context.js";

const workflow: WorkflowDefinition = {
  id: "workflow-1",
  name: "Trigger To Transform",
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
          username: "name",
          userEmail: "email",
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

const engine = new ExecutionEngine(workflow, graph, registry);

const context: ExecutionContext = {
  executionId: "execution-1",
  workflowId: workflow.id,
  status: "pending",
  currentNodeId: null,

  triggerInput: {
    name: "Kamal",
    email: "kamal@example.com",
    age: 21,
  },

  nodeOutputs: new Map(),

  startedAt: new Date().toISOString(),
};

const result = await engine.execute(context);

console.log("\nExecution status:");
console.log(result.status);

console.log("\nNode outputs:");

for (const [nodeId, output] of result.nodeOutputs) {
  console.log(nodeId, "→", output);
}
