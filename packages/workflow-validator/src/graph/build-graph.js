export function buildGraph(workflow) {
    const nodes = new Map();
    const edges = new Map();
    const adjacency = new Map();
    const reverseAdjacency = new Map();
    const outgoingEdges = new Map();
    const incomingEdges = new Map();
    for (const node of workflow.nodes) {
        nodes.set(node.id, node);
        adjacency.set(node.id, []);
        reverseAdjacency.set(node.id, []);
        outgoingEdges.set(node.id, []);
        incomingEdges.set(node.id, []);
    }
    for (const edge of workflow.edges) {
        edges.set(edge.id, edge);
        adjacency.get(edge.source)?.push(edge.target);
        reverseAdjacency.get(edge.target)?.push(edge.source);
        outgoingEdges.get(edge.source)?.push(edge);
        incomingEdges.get(edge.target)?.push(edge);
    }
    return {
        nodes,
        edges,
        adjacency,
        reverseAdjacency,
        outgoingEdges,
        incomingEdges,
    };
}
