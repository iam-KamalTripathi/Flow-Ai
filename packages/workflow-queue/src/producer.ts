import { Queue } from "bullmq";

import { EXECUTION_QUEUE_NAME, type ExecutionJobData } from "./contract.js";

let executionQueue: Queue<ExecutionJobData> | undefined;

function getExecutionQueue(): Queue<ExecutionJobData> {
  if (!executionQueue) {
    executionQueue = new Queue<ExecutionJobData>(EXECUTION_QUEUE_NAME, {
      connection: {
        host: process.env.REDIS_HOST ?? "localhost",
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    });
  }

  return executionQueue;
}

export async function enqueueExecution(data: ExecutionJobData) {
  return getExecutionQueue().add("execute-workflow", data, {
    jobId: data.executionId,
  });
}

export async function closeExecutionQueue(): Promise<void> {
  if (!executionQueue) {
    return;
  }

  await executionQueue.close();
  executionQueue = undefined;
}
