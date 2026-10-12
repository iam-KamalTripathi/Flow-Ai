export const EXECUTION_QUEUE_NAME = "workflow-execution";

export interface ExecutionJobData {
  executionId: string;
  workflowId: string;
}
