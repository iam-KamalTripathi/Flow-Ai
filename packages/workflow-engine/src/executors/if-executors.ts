import type { WorkflowNode } from "@FlowAi/workflow-core";
import type { IfConfig, Condition } from "@FlowAi/node-definitions";

import type { ExecutionContext } from "../context/execution-context.js";

import type { NodeExecutionResult, NodeExecutor } from "./node-executor.js";

export class IfExecutor implements NodeExecutor {
  async execute(
    node: WorkflowNode<IfConfig>,
    input: unknown,
    _context: ExecutionContext,
  ): Promise<NodeExecutionResult> {
    const config = node.config;

    const results = config.conditions.map((condition) =>
      this.evaluateCondition(condition, input),
    );

    const conditionResult =
      config.combinator === "AND"
        ? results.every(Boolean)
        : results.some(Boolean);

    return {
      output: input,
      outputHandle: conditionResult ? "true" : "false",
    };
  }

  private evaluateCondition(condition: Condition, input: unknown): boolean {
    const fieldValue = this.getFieldValue(input, condition.field);

    const expectedValue = condition.value;

    switch (condition.operator) {
      case "equals":
        return fieldValue === expectedValue;

      case "not_equals":
        return fieldValue !== expectedValue;

      case "greater_than":
        return (
          typeof fieldValue === "number" &&
          typeof expectedValue === "number" &&
          fieldValue > expectedValue
        );

      case "less_than":
        return (
          typeof fieldValue === "number" &&
          typeof expectedValue === "number" &&
          fieldValue < expectedValue
        );

      case "greater_than_or_equal":
        return (
          typeof fieldValue === "number" &&
          typeof expectedValue === "number" &&
          fieldValue >= expectedValue
        );

      case "less_than_or_equal":
        return (
          typeof fieldValue === "number" &&
          typeof expectedValue === "number" &&
          fieldValue <= expectedValue
        );

      case "contains":
        return (
          typeof fieldValue === "string" &&
          typeof expectedValue === "string" &&
          fieldValue.includes(expectedValue)
        );

      default:
        return false;
    }
  }

  private getFieldValue(input: unknown, field: string): unknown {
    if (typeof input !== "object" || input === null || Array.isArray(input)) {
      return undefined;
    }

    const data = input as Record<string, unknown>;

    return data[field];
  }
}
