import type { WorkflowDefinition } from "./packages/workflow-core/src/index.js";

import { buildGraph } from "./packages/workflow-validator/src/index.js";

import {
  ExecutorRegistry,
  ExecutionEngine,
} from "./packages/workflow-engine/src/index.js";

import type { ExecutionContext } from "./packages/workflow-engine/src/context/execution-context.js";

// ==================================================
// WORKFLOW
// ==================================================

const workflow: WorkflowDefinition = {
  id: "workflow-if-1",
  name: "Manual IF Branching",
  version: 1,

  nodes: [
    // ----------------------------------------------
    // Manual Trigger
    // ----------------------------------------------
    {
      id: "trigger-1",
      type: "trigger.manual",
      position: {
        x: 0,
        y: 0,
      },
      config: {},
    },

    // ----------------------------------------------
    // IF Node
    // ----------------------------------------------
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

    // ----------------------------------------------
    // TRUE branch
    // ----------------------------------------------
    {
      id: "transform-true",
      type: "data.transform",
      position: {
        x: 600,
        y: -100,
      },
      config: {
        mappings: {
          message: "message",
          status: "status",
        },
      },
    },

    // ----------------------------------------------
    // FALSE branch
    // ----------------------------------------------
    {
      id: "transform-false",
      type: "data.transform",
      position: {
        x: 600,
        y: 100,
      },
      config: {
        mappings: {
          message: "message",
          status: "status",
        },
      },
    },
  ],

  edges: [
    // ----------------------------------------------
    // Trigger → IF
    // ----------------------------------------------
    {
      id: "edge-trigger-if",
      source: "trigger-1",
      sourceHandle: "main",
      target: "if-1",
      targetHandle: "main",
    },

    // ----------------------------------------------
    // IF TRUE → Transform TRUE
    // ----------------------------------------------
    {
      id: "edge-if-true",
      source: "if-1",
      sourceHandle: "true",
      target: "transform-true",
      targetHandle: "main",
    },

    // ----------------------------------------------
    // IF FALSE → Transform FALSE
    // ----------------------------------------------
    {
      id: "edge-if-false",
      source: "if-1",
      sourceHandle: "false",
      target: "transform-false",
      targetHandle: "main",
    },
  ],
};

// ==================================================
// BUILD GRAPH
// ==================================================

const graph = buildGraph(workflow);

// ==================================================
// EXECUTOR REGISTRY
// ==================================================

const registry = new ExecutorRegistry();

// ==================================================
// EXECUTION CONTEXT
// ==================================================

const context: ExecutionContext = {
  executionId: "execution-if-1",

  workflowId: workflow.id,

  status: "pending",

  currentNodeId: null,

  triggerInput: {
    status: 200,
    message: "Hello from IF test",
  },

  nodeOutputs: new Map<string, unknown>(),

  startedAt: new Date().toISOString(),
};

// ==================================================
// EXECUTION ENGINE
// ==================================================

const engine = new ExecutionEngine(workflow, graph, registry, {
  maxRetries: 2,
});

// ==================================================
// RUN WORKFLOW
// ==================================================

async function main(): Promise<void> {
  const result = await engine.execute(context);

  console.log("\n=================================");
  console.log("       IF WORKFLOW RESULT");
  console.log("=================================\n");

  console.log("Status:", result.status);

  console.log("Current node:", result.currentNodeId);

  console.log("Error:", result.error);

  // ----------------------------------------------
  // Print outputs
  // ----------------------------------------------

  console.log("\n=================================");
  console.log("          NODE OUTPUTS");
  console.log("=================================\n");

  for (const [nodeId, output] of result.nodeOutputs) {
    console.log(`${nodeId} =>`);

    console.dir(output, {
      depth: null,
    });

    console.log();
  }

  // ----------------------------------------------
  // Verify TRUE branch
  // ----------------------------------------------

  const trueBranchExecuted = result.nodeOutputs.has("transform-true");

  const falseBranchExecuted = result.nodeOutputs.has("transform-false");

  console.log("\n=================================");
  console.log("          BRANCH CHECK");
  console.log("=================================\n");

  console.log("TRUE branch executed:", trueBranchExecuted);

  console.log("FALSE branch executed:", falseBranchExecuted);
}

main().catch((error) => {
  console.error("\nIF workflow test failed:");

  console.error(error);

  // process.exit(1);
});
