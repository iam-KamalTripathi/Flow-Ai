import type { WorkflowDefinition } from "@FlowAi/workflow-core";

import type { CanvasGraph } from "./canvas-types";

// Convert the saved workflow model into React Flow data.
export function workflowToCanvas(workflow: WorkflowDefinition): CanvasGraph {
  return {
    nodes: workflow.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        config: node.config,
      },
    })),

    edges: workflow.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      sourceHandle: edge.sourceHandle,
      target: edge.target,
      targetHandle: edge.targetHandle,
      type: "smoothstep",
    })),
  };
}

// Convert the React Flow graph into the shared workflow model.
export function canvasToWorkflow(
  workflowInfo: Pick<WorkflowDefinition, "id" | "name" | "version">,
  graph: CanvasGraph,
): WorkflowDefinition {
  return {
    ...workflowInfo,

    nodes: graph.nodes.map((node) => {
      if (!node.type) {
        throw new Error(`Canvas node "${node.id}" is missing its type.`);
      }

      return {
        id: node.id,
        type: node.type,
        position: node.position,
        config: node.data.config,
      };
    }),

    edges: graph.edges.map((edge) => {
      const sourceHandle = edge.sourceHandle;
      const targetHandle = edge.targetHandle;

      if (!sourceHandle || !targetHandle) {
        throw new Error(
          `Edge "${edge.id}" is missing a source or target handle.`,
        );
      }

      return {
        id: edge.id,
        source: edge.source,
        sourceHandle,
        target: edge.target,
        targetHandle,
      };
    }),
  };
}
