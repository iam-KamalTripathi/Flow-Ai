import {
  ExecutionContext,
  ExecutionEngine,
  ExecutorRegistory,
  ManualTriggerExecutor,
} from "./src/index.js";

import type { WorkflowDefinition } from "@FlowAi/workflow-core";

import { buildGraph } from "@FlowAi/workflow-validator";

const workflow: WorkflowDefinition = {
  id: "workflow-1",
  name: "Test Workflow",
  version: 1,

  nodes: [
    {
      id: "trigger-1",
      type: "trigger.manual",
      position: { x: 0, y: 0 },
      config: {},
    },
  ],

  edges: [],
};

const graph = buildGraph(workflow);

const registry = new ExecutorRegistory();

registry.register("trigger.manual", new ManualTriggerExecutor());

const context: ExecutionContext = {
  executionId: "execution-1",
  workflowId: workflow.id,
  status: "pending",
  currentNodeId: null,
  triggerInput: {
    message: "hello flowAi",
  },
  nodeOutputs: new Map(),
  startedAt: new Date().toISOString(),
};

const engine = new ExecutionEngine(workflow, graph, registry);

const result = await engine.execute(context);

console.log("Status: ", result.status);
console.log("Trigger Output:", result.nodeOutputs.get("trigger-1"));
