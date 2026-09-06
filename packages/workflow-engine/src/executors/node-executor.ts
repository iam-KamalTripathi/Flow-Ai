import type { WorkflowNode } from "@FlowAi/workflow-core";

import type { ExecutionContext } from "../context/execution-context.js";

export interface NodeExecutor<TConfig = unknown> {
  execute(
    node: WorkflowNode<TConfig>,
    input: unknown,
    context: ExecutionContext,
  ): Promise<unknown>;
}
