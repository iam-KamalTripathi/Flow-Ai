import type { WorkflowEdge } from "./edge.js";
import type { WorkflowNode } from "./node.js";
export interface WorkflowMetaData {
    createdAt?: string;
    updatedAt?: string;
}
export interface WorkflowDefinition {
    id: string;
    name: string;
    version: number;
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    metadata?: WorkflowMetaData;
}
//# sourceMappingURL=workflow.d.ts.map