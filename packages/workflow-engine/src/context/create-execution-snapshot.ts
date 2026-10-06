import type { ExecutionContext } from "./execution-context.js";
import type { ExecutionSnapshot } from "./execution-snapshot.js";

export function createExecutionSnapshot(
  context: ExecutionContext,
): ExecutionSnapshot {
  const snapshot: ExecutionSnapshot = {
    currentNodeId: context.currentNodeId,
    nodeOutputs: Object.fromEntries(context.nodeOutputs),
    triggerInput: context.triggerInput,
  };

  if (context.retryState !== undefined) {
    snapshot.retryState = context.retryState;
  }

  return snapshot;
}
