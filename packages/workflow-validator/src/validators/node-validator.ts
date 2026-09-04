import type { WorkflowDefinition } from "@FlowAi/workflow-core";
import { getNodeDefinition } from "@FlowAi/node-definitions";

import type { ValidationIssue } from "../types.js";

export function validateNodes(workflow: WorkflowDefinition): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (workflow.nodes.length === 0) {
    issues.push({
      code: "EMPTY_WORKFLOW",
      message: "Workflow must contain at least one node.",
      severity: "error",
    });

    return issues;
  }

  const nodeIds = new Set<string>();

  for (const node of workflow.nodes) {
    if (nodeIds.has(node.id)) {
      issues.push({
        code: "DUPLICATE_NODE_ID",
        message: `Duplicate node ID "${node.id}".`,
        severity: "error",
        nodeId: node.id,
      });
    }

    nodeIds.add(node.id);

    const definition = getNodeDefinition(node.type);

    if (!definition) {
      issues.push({
        code: "UNKNOWN_NODE_TYPE",
        message: `Unknown node type "${node.type}".`,
        severity: "error",
        nodeId: node.id,
        field: "type",
      });

      continue;
    }

    if (node.config === null || typeof node.config !== "object") {
      issues.push({
        code: "INVALID_NODE_CONFIG",
        message: `Invalid configuration for node "${node.id}".`,
        severity: "error",
        nodeId: node.id,
        field: "config",
      });
    }
  }

  return issues;
}
