import { getNodeDefinition } from "@FlowAi/node-definitions";
export function validateEdges(workflow) {
    const issues = [];
    const nodes = new Map(workflow.nodes.map((node) => [node.id, node]));
    for (const edge of workflow.edges) {
        validateEdgeEndpoints(edge, nodes, issues);
        validateHandles(edge, nodes, issues);
        if (edge.source === edge.target) {
            issues.push({
                code: "SELF_CONNECTION",
                message: `Node "${edge.source}" cannot connect to itself.`,
                severity: "error",
                edgeId: edge.id,
            });
        }
    }
    validateConnectionLimits(workflow, issues);
    return issues;
}
function validateEdgeEndpoints(edge, nodes, issues) {
    if (!nodes.has(edge.source)) {
        issues.push({
            code: "INVALID_EDGE_SOURCE",
            message: `Edge "${edge.id}" references unknown source node "${edge.source}".`,
            severity: "error",
            edgeId: edge.id,
        });
    }
    if (!nodes.has(edge.target)) {
        issues.push({
            code: "INVALID_EDGE_TARGET",
            message: `Edge "${edge.id}" references unknown target node "${edge.target}".`,
            severity: "error",
            edgeId: edge.id,
        });
    }
}
function validateHandles(edge, nodes, issues) {
    const sourceNode = nodes.get(edge.source);
    const targetNode = nodes.get(edge.target);
    if (!sourceNode || !targetNode) {
        return;
    }
    const sourceDefinition = getNodeDefinition(sourceNode.type);
    const targetDefinition = getNodeDefinition(targetNode.type);
    if (!sourceDefinition || !targetDefinition) {
        return;
    }
    const sourcePort = sourceDefinition.outputs.find((port) => port.id === edge.sourceHandle);
    if (!sourcePort) {
        issues.push({
            code: "INVALID_SOURCE_HANDLE",
            message: `Edge "${edge.id}" uses invalid source handle ` +
                `"${edge.sourceHandle}".`,
            severity: "error",
            edgeId: edge.id,
            field: "sourceHandle",
        });
    }
    const targetPort = targetDefinition.inputs.find((port) => port.id === edge.targetHandle);
    if (!targetPort) {
        issues.push({
            code: "INVALID_TARGET_HANDLE",
            message: `Edge "${edge.id}" uses invalid target handle ` +
                `"${edge.targetHandle}".`,
            severity: "error",
            edgeId: edge.id,
            field: "targetHandle",
        });
    }
}
function validateConnectionLimits(workflow, issues) {
    for (const node of workflow.nodes) {
        const definition = getNodeDefinition(node.type);
        if (!definition) {
            continue;
        }
        for (const port of definition.inputs) {
            if (port.maxConnections === undefined) {
                continue;
            }
            const count = workflow.edges.filter((edge) => edge.target === node.id && edge.targetHandle === port.id).length;
            if (count > port.maxConnections) {
                issues.push({
                    code: "INPUT_LIMIT_EXCEEDED",
                    message: `Input "${port.id}" on node "${node.id}" allows ` +
                        `${port.maxConnections} connection(s), but received ${count}.`,
                    severity: "error",
                    nodeId: node.id,
                    field: `inputs.${port.id}`,
                });
            }
        }
        for (const port of definition.outputs) {
            if (port.maxConnections === undefined) {
                continue;
            }
            const count = workflow.edges.filter((edge) => edge.source === node.id && edge.sourceHandle === port.id).length;
            if (count > port.maxConnections) {
                issues.push({
                    code: "OUTPUT_LIMIT_EXCEEDED",
                    message: `Output "${port.id}" on node "${node.id}" allows ` +
                        `${port.maxConnections} connection(s), but has ${count}.`,
                    severity: "error",
                    nodeId: node.id,
                    field: `outputs.${port.id}`,
                });
            }
        }
    }
}
