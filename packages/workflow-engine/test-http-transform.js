import { HttpRequestExecutor } from "./src/executors/http-request-executor.js";
import { TransformExecutor } from "./src/executors/transform-executor.js";
const httpNode = {
    id: "http-1",
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
const transformNode = {
    id: "transform-1",
    type: "data.transform",
    position: {
        x: 300,
        y: 0,
    },
    config: {
        mappings: {
            httpStatus: "status",
        },
    },
};
const context = {
    executionId: "test-execution",
    workflowId: "test-workflow",
    status: "running",
    currentNodeId: null,
    triggerInput: null,
    nodeOutputs: new Map(),
    startedAt: new Date().toISOString(),
};
const httpExecutor = new HttpRequestExecutor();
const transformExecutor = new TransformExecutor();
console.log("=== HTTP EXECUTOR ===");
const httpOutput = await httpExecutor.execute(httpNode, null, context);
console.dir(httpOutput, { depth: null });
console.log("\n=== TRANSFORM EXECUTOR ===");
const transformOutput = await transformExecutor.execute(transformNode, httpOutput, context);
console.dir(transformOutput, { depth: null });
