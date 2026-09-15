import type { WorkflowDefinition, WorkflowNode, WorkflowEdge } from "@FlowAi/workflow-core";
export interface WorkflowGraph {
    nodes: Map<string, WorkflowNode>;
    edges: Map<string, WorkflowEdge>;
    adjacency: Map<string, string[]>;
    reverseAdjacency: Map<string, string[]>;
    outgoingEdges: Map<string, WorkflowEdge[]>;
    incomingEdges: Map<string, WorkflowEdge[]>;
}
export declare function buildGraph(workflow: WorkflowDefinition): WorkflowGraph;
//# sourceMappingURL=build-graph.d.ts.map