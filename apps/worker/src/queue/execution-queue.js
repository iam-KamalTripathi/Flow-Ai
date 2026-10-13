import { Queue } from "bullmq";
export const EXECUTION_QUEUE_NAME = "workflow-execution";
const connection = {
    host: process.env.REDIS_HOST ?? "localhost",
    port: Number(process.env.REDIS_PORT ?? 6379),
};
export const executionQueue = new Queue(EXECUTION_QUEUE_NAME, {
    connection,
});
export async function enqueueExecution(data) {
    return executionQueue.add("execute-workflow", data);
}
