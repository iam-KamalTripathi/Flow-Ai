import { type ExecutionJobData } from "./contract.js";
export declare function enqueueExecution(data: ExecutionJobData): Promise<import("bullmq").Job<ExecutionJobData, any, string, import("bullmq").JobProgress>>;
export declare function closeExecutionQueue(): Promise<void>;
//# sourceMappingURL=producer.d.ts.map