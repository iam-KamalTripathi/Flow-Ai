import type { RetryState } from "./execution-context";
export interface ExecutionSnapshot {
    currentNodeId: string | null;
    nodeOutputs: Record<string, unknown>;
    triggerInput: unknown;
    retryState?: RetryState;
}
//# sourceMappingURL=execution-snapshot.d.ts.map