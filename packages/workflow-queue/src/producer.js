import { Queue } from "bullmq";
import { EXECUTION_QUEUE_NAME } from "./contract.js";
let executionQueue;
function getExecutionQueue() {
    if (!executionQueue) {
        executionQueue = new Queue(EXECUTION_QUEUE_NAME, {
            connection: {
                host: process.env.REDIS_HOST ?? "localhost",
                port: Number(process.env.REDIS_PORT ?? 6379),
            },
        });
    }
    return executionQueue;
}
export async function enqueueExecution(data) {
    return getExecutionQueue().add("execute-workflow", data, {
        jobId: data.executionId,
    });
}
export async function closeExecutionQueue() {
    if (!executionQueue) {
        return;
    }
    await executionQueue.close();
    executionQueue = undefined;
}
