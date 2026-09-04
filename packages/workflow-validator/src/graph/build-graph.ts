import type {
  WorkflowDefinition,
  WorkflowNode,
  WorkflowEdge,
} from "@FlowAi/workflow-core";

export interface WorkflowGraph {
  nodes: Map<string, WorkflowNode>;
  edges: Map<string, WorkflowEdge>;

  adjacency: Map<string, string[]>;

  reverseAdjacency: Map<string, string[]>;

  outgoingEdges: Map<string, WorkflowEdge[]>;
  incomingEdges: Map<string, WorkflowEdge[]>;
}

export function buildGraph(workflow: WorkflowDefinition): WorkflowGraph {
  const nodes = new Map<string, WorkflowNode>();
  const edges = new Map<string, WorkflowEdge>();

  const adjacency = new Map<string, string[]>();
  const reverseAdjacency = new Map<string, string[]>();

  const outgoingEdges = new Map<string, WorkflowEdge[]>();
  const incomingEdges = new Map<string, WorkflowEdge[]>();

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
