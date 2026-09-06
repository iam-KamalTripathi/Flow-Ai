import type { WorkflowEdge } from "./edge";
import type { WorkflowNode } from "./node";

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
