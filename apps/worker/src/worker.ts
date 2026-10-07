import { Worker, type Job } from "bullmq";

import {
  EXECUTION_QUEUE_NAME,
  type ExecutionJobData,
} from "./queue/execution-queue.js";

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
};

const worker = new Worker<ExecutionJobData>(
  EXECUTION_QUEUE_NAME,
  async (job: Job<ExecutionJobData>) => {
    console.log("Received execution job:");

    console.log({
      jobId: job.id,
      executionId: job.data.executionId,
      workflowId: job.data.workflowId,
    });
  },
  {
    connection,
  },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed.`);
});

worker.on("failed", (job, error) => {
  console.error(`Job ${job?.id ?? "unknown"} failed:`, error);
});

worker.on("error", (error) => {
  console.error("Worker error:", error);
});

console.log(`FlowAI worker listening on queue "${EXECUTION_QUEUE_NAME}"...`);
