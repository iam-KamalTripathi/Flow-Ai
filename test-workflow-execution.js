import { buildGraph } from "./packages/workflow-validator/src/index.js";
import { ExecutorRegistry, ExecutionEngine, } from "./packages/workflow-engine/src/index.js";
const workflow = {
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
// --------------------------------------------------
// Build workflow graph
// --------------------------------------------------
const graph = buildGraph(workflow);
// --------------------------------------------------
// Create executor registry
// --------------------------------------------------
const registry = new ExecutorRegistry();
// --------------------------------------------------
// Create execution context
// --------------------------------------------------
const context = {
    executionId: "execution-1",
    workflowId: workflow.id,
    status: "pending",
    currentNodeId: null,
    triggerInput: {
        message: "Start execution",
    },
    nodeOutputs: new Map(),
    startedAt: new Date().toISOString(),
};
// --------------------------------------------------
// Create execution engine
// --------------------------------------------------
const engine = new ExecutionEngine(workflow, graph, registry, {
    maxRetries: 2,
});
// --------------------------------------------------
// Execute workflow
// --------------------------------------------------
async function main() {
    const result = await engine.execute(context);
    console.log("\n=================================");
    console.log("       EXECUTION RESULT");
    console.log("=================================\n");
    console.log("Status:", result.status);
    console.log("Current node:", result.currentNodeId);
    console.log("Error:", result.error);
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
}
main().catch((error) => {
    console.error("\nExecution test failed:");
    console.error(error);
    // process.exit(1);
});
