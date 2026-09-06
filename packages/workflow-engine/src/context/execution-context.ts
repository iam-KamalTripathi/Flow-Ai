export type ExecutionStatus = "pending" | "running" | "success" | "failed";

export interface ExecutionContext {
  executionId: string;
  worflowId: string;
  status: ExecutionStatus;
  currentNodeId: string | null;
  triggerInput: unknown;
  nodeOutputs: Map<string, unknown>;
  startedAt: string;
}
