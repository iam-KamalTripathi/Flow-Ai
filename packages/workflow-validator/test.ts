import type { WorkflowDefinition } from "@FlowAi/workflow-core";

import { buildGraph } from "./src/graph/build-graph.js";

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
    {
      id: "http-1",
      type: "action.http",
      position: { x: 200, y: 0 },
      config: {},
    },
    {
      id: "transform-1",
      type: "data.transform",
      position: { x: 400, y: 0 },
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

console.log("Nodes: ", graph.nodes);
console.log("Edges: ", graph.edges);

console.log("Adjacency: ", graph.adjacency);
console.log("Reverse Adjacency: ", graph.reverseAdjacency);

console.log("Outgoingedges: ", graph.outgoingEdges);
console.log("Incomingedges: ", graph.incomingEdges);
