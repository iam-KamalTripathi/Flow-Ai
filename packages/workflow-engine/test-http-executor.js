import { HttpRequestExecutor } from "./src/executors/http-request-executor.js";
const node = {
    id: "http-test-1",
    type: "action.http",
    position: {
        x: 0,
        y: 0,
    },
    config: {
        method: "GET",
        url: "https://jsonplaceholder.typicode.com/todos/1",
        headers: {},
        query: {},
    },
};
const context = {
    executionId: "test-execution",
    workflowId: "test-workflow",
    status: "running",
    currentNodeId: node.id,
    triggerInput: null,
    nodeOutputs: new Map(),
    startedAt: new Date().toISOString(),
};
const input = {
    message: "Hello from test",
};
const executor = new HttpRequestExecutor();
const output = await executor.execute(node, input, context);
console.log("\n=== HTTP EXECUTOR TEST ===");
console.log("Node:", node.id);
console.log("Input:", input);
console.log("\nOutput:");
console.dir(output, { depth: null });
