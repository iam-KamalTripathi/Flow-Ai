import { getNodeDefinition } from "@FlowAi/node-definitions";
export function validateNodes(workflow) {
    const issues = [];
    if (workflow.nodes.length === 0) {
        issues.push({
            code: "EMPTY_WORKFLOW",
            message: "Workflow must contain at least one node.",
            severity: "error",
        });
        return issues;
    }
    const nodeIds = new Set();
    let triggerCount = 0;
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
        if (node.type.startsWith("trigger.")) {
            triggerCount++;
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
    if (triggerCount === 0) {
        issues.push({
            code: "NO_TRIGGER",
            message: "Workflow must contain at least one trigger node.",
            severity: "error",
        });
    }
    if (triggerCount > 1) {
        issues.push({
            code: "MULTIPLE_TRIGGERS",
            message: "Workflow must contain exactly one trigger node.",
            severity: "error",
        });
    }
    return issues;
}
