import type { WorkflowDefinition, WorkflowNode } from "@FlowAi/workflow-core";

import type { ExecutionContext } from "../context/execution-context.js";

import type { NodeExecutor } from "./node-executor.js";

export class ManualTriggerExecutor implements NodeExecutor {
  async execute(
    _node: WorkflowNode,
    input: unknown,
    _context: ExecutionContext,
  ): Promise<unknown> {
    return input;
  }
}
