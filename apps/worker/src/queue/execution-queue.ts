import { Queue } from "bullmq";

export const EXECUTION_QUEUE_NAME = "workflow-execution";

export interface ExecutionJobData {
  executionId: string;
  workflowId: string;
}

const connection = {
  host: process.env.REDIS_HOST ?? "localhost",
  port: Number(process.env.REDIS_PORT ?? 6379),
};

export const executionQueue = new Queue<ExecutionJobData>(
  EXECUTION_QUEUE_NAME,
  {
    connection,
  },
);
