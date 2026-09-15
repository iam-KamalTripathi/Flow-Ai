import { getNodeDefinition } from "@FlowAi/node-definitions";
export function validateTopology(workflow, graph) {
    const issues = [];
    validateTriggers(workflow, graph, issues);
    validateCycles(graph, issues);
    validateReachability(workflow, graph, issues);
    return issues;
}
function validateTriggers(workflow, graph, issues) {
    const triggerNodes = workflow.nodes.filter((node) => {
        const definition = getNodeDefinition(node.type);
        return definition?.category === "trigger";
    });
    if (triggerNodes.length === 0) {
        issues.push({
            code: "NO_TRIGGER",
            message: "Workflow must contain at least one trigger node.",
            severity: "error",
        });
        return;
    }
    for (const node of triggerNodes) {
        const incomingEdges = graph.incomingEdges.get(node.id) ?? [];
        if (incomingEdges.length > 0) {
            issues.push({
                code: "TRIGGER_HAS_INPUT",
                message: `Trigger node ${node.id} cannot have incoming connecitons`,
                severity: "error",
                nodeId: node.id,
            });
            return;
        }
    }
}
function validateCycles(graph, issues) {
    const visiting = new Set();
    const visited = new Set();
    for (const nodeId of graph.nodes.keys()) {
        if (visited.has(nodeId)) {
            continue;
        }
        if (hasCycle(nodeId, graph, visiting, visited)) {
            issues.push({
                code: "CYCLE_DETECTED",
                message: `Workflow contains a cycle involving node "${nodeId}".`,
                severity: "error",
                nodeId,
            });
            return;
        }
    }
}
function validateReachability(workflow, graph, issue) {
    const triggerNodes = workflow.nodes.filter((node) => {
        const definition = getNodeDefinition(node.type);
        return definition?.category === "trigger";
    });
    if (triggerNodes.length === 0)
        return;
    const rechable = new Set();
    const queue = [];
    for (const trigger of triggerNodes) {
        rechable.add(trigger.id);
        queue.push(trigger.id);
    }
    while (queue.length > 0) {
        const currentNodeId = queue.shift();
        const neighbours = graph.adjacency.get(currentNodeId) ?? [];
        for (const neighbour of neighbours) {
            if (rechable.has(neighbour))
                continue;
            rechable.add(neighbour);
            queue.push(neighbour);
        }
    }
    for (const node of workflow.nodes) {
        if (rechable.has(node.id))
            continue;
        issue.push({
            code: "UNREACHABLE_NODE",
            message: `Node ${node.id} cannot be reached from any trigger`,
            severity: "error",
            nodeId: node.id,
        });
    }
}
function hasCycle(nodeId, graph, visiting, visited) {
    if (visiting.has(nodeId)) {
        return true;
    }
    if (visited.has(nodeId)) {
        return false;
    }
    visiting.add(nodeId);
    const neighbours = graph.adjacency.get(nodeId) ?? [];
    for (const neighbour of neighbours) {
        if (hasCycle(neighbour, graph, visiting, visited)) {
            return true;
        }
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    return false;
}
