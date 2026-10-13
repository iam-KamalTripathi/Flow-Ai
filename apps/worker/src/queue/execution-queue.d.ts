import { Queue } from "bullmq";
export declare const EXECUTION_QUEUE_NAME = "workflow-execution";
export interface ExecutionJobData {
    executionId: string;
    workflowId: string;
}
export declare const executionQueue: Queue<ExecutionJobData, any, string, ExecutionJobData, any, string, import("bullmq").RedisQueueBackend, import("bullmq").ConnectionOptions>;
export declare function enqueueExecution(data: ExecutionJobData): Promise<import("bullmq").Job<ExecutionJobData, any, string, import("bullmq").JobProgress>>;
//# sourceMappingURL=execution-queue.d.ts.map