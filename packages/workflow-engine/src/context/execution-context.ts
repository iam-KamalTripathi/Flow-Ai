export type ExecutionStatus = "pending" | "running" | "success" | "failed";

export interface ExecutionError {
  nodeId: string;
  message: string;
  retryable: boolean;
}

export interface RetryState {
  attempts: number;
  maxAttempts: number;
}

export interface ExecutionContext {
  executionId: string;
  workflowId: string;
  status: ExecutionStatus;
  currentNodeId: string | null;
  triggerInput: unknown;
  nodeOutputs: Map<string, unknown>;
  startedAt: string;
  error?: ExecutionError;
  retryState?: RetryState;
}
