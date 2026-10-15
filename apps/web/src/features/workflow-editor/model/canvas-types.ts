import type { Edge, Node } from "@xyflow/react";

export type CanvasNodeData = {
  config: unknown;
};

export type CanvasNode = Node<CanvasNodeData>;

export type CanvasEdge = Edge;

export interface CanvasGraph {
  nodes: CanvasNode[];
  edges: CanvasEdge[];
}
