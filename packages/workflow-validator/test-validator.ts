import type { WorkflowDefinition } from "@FlowAi/workflow-core";
import { buildGraph } from "./src/index.js";
import { validateWorkflow } from "./src/index.js";

const workflow: WorkflowDefinition = {
  id: "workflow-1",
  name: "Test Workflow",
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
        x: 200,
        y: 0,
      },
      config: {},
    },

    {
      id: "transform-1",
      type: "data.transform",
      position: {
        x: 400,
        y: 0,
      },
      config: {},
    },
    {
      id: "isolated-1",
      type: "data.transform",
      position: {
        x: 600,
        y: 200,
      },
      config: {},
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

console.log("ADJACENCY :");
for (const [nodeId, neighbours] of graph.adjacency) {
  console.log(nodeId, "-->", neighbours);
}

const result = validateWorkflow(workflow);

console.log("Valid:", result.valid);

console.log("Errors:", result.errors);

console.log("Warnings:", result.warnings);

console.log("Node Errors:", result.nodeErrors);

console.log("Edge Errors:", result.edgeErrors);
