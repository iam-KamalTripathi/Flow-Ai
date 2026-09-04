import { validateWorkflow } from "./src/index.js";

const workflow = {
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
        x: 300,
        y: 0,
      },
      config: {
        method: "GET",
        url: "https://example.com",
        headers: {},
        query: {},
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
  ],
};

const result = validateWorkflow(workflow);

console.log(JSON.stringify(result, null, 2));
