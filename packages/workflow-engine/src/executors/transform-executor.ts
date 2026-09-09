import type { WorkflowNode } from "@FlowAi/workflow-core";
import type { TransformConfig } from "@FlowAi/node-definitions";

import type { ExecutionContext } from "../context/execution-context.js";

import type { NodeExecutor } from "./node-executor.js";

export class TransformExecutor implements NodeExecutor {
  async execute(
    node: WorkflowNode<TransformConfig>,
    input: unknown,
    _context: ExecutionContext,
  ): Promise<unknown> {
    const config = node.config;

    if (typeof input !== "object" || input == null || Array.isArray(input)) {
      throw new Error(`Transform node ${node.id} expects an object as input.`);
    }

    const inputData = input as Record<string, unknown>;
    const output: Record<string, unknown> = {};

    for (const [outputKey, inputKey] of Object.entries(config.mappings) as [
      string,
      string,
    ][]) {
      output[outputKey] = inputData[inputKey];
    }

    return output;
  }
}
