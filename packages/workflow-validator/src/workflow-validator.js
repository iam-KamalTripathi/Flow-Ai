import { validateNodes } from "./validators/node-validator.js";
import { validateEdges } from "./validators/edge-validator.js";
import { buildGraph } from "./graph/build-graph.js";
import { validateTopology } from "./validators/topology-validators.js";
export function validateWorkflow(workflow) {
    const issues = [];
    const nodeIssues = validateNodes(workflow);
    const edgeIssues = validateEdges(workflow);
    const graph = buildGraph(workflow);
    const topologyIssues = validateTopology(workflow, graph);
    issues.push(...nodeIssues, ...edgeIssues, ...topologyIssues);
    const errors = issues.filter((issue) => issue.severity === "error");
    const warnings = issues.filter((issue) => issue.severity === "warning");
    const nodeErrors = {};
    const edgeErrors = {};
    for (const issue of issues) {
        if (issue.nodeId !== undefined) {
            const nodeIssues = nodeErrors[issue.nodeId] ?? [];
            nodeIssues.push(issue);
            nodeErrors[issue.nodeId] = nodeIssues;
        }
        if (issue.edgeId !== undefined) {
            const edgeIssues = edgeErrors[issue.edgeId] ?? [];
            edgeIssues.push(issue);
            edgeErrors[issue.edgeId] = edgeIssues;
        }
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
        nodeErrors,
        edgeErrors,
    };
}
