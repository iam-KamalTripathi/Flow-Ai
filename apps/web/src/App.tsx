import { useCallback } from "react";
import {
  addEdge,
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
  type Connection,
  type Edge,
  type Node,
  type NodeProps,
  type NodeTypes,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import "./App.css";

type CanvasNodeKind = "manualTrigger" | "transform" | "httpRequest";

type CanvasNodeData = {
  label: string;
  description: string;
  category: string;
  glyph: string;
};

type CanvasNode = Node<CanvasNodeData, CanvasNodeKind>;

const nodeTemplates: Record<CanvasNodeKind, CanvasNodeData> = {
  manualTrigger: {
    label: "Manual Trigger",
    description: "Start this workflow manually",
    category: "TRIGGER",
    glyph: "▶",
  },
  transform: {
    label: "Transform",
    description: "Shape or map your data",
    category: "DATA",
    glyph: "ƒx",
  },
  httpRequest: {
    label: "HTTP Request",
    description: "Call an external API",
    category: "ACTION",
    glyph: "↗",
  },
};

const initialNodes: CanvasNode[] = [
  {
    id: "trigger-1",
    type: "manualTrigger",
    position: { x: 240, y: 100 },
    data: nodeTemplates.manualTrigger,
  },
  {
    id: "transform-1",
    type: "transform",
    position: { x: 240, y: 300 },
    data: nodeTemplates.transform,
  },
];

const initialEdges: Edge[] = [
  {
    id: "trigger-1-transform-1",
    source: "trigger-1",
    sourceHandle: "main",
    target: "transform-1",
    targetHandle: "main",
    type: "smoothstep",
  },
];

function ManualTriggerNode({ data }: NodeProps) {
  const nodeData = data as CanvasNodeData;

  return (
    <div className='flow-node trigger-node'>
      <Handle
        type='source'
        position={Position.Bottom}
        id='main'
        className='flow-handle'
      />

      <div className='node-category'>{nodeData.category}</div>

      <div className='node-heading'>
        <div className='node-glyph trigger-glyph'>{nodeData.glyph}</div>
        <div className='node-heading-text'>
          <strong>{nodeData.label}</strong>
          <span>{nodeData.description}</span>
        </div>
      </div>

      <div className='node-footer'>
        <span className='status-dot' />
        Ready to trigger
      </div>
    </div>
  );
}

function TransformNode({ data }: NodeProps) {
  const nodeData = data as CanvasNodeData;

  return (
    <div className='flow-node transform-node'>
      <Handle
        type='target'
        position={Position.Top}
        id='main'
        className='flow-handle'
      />

      <Handle
        type='source'
        position={Position.Bottom}
        id='main'
        className='flow-handle'
      />

      <div className='node-category'>{nodeData.category}</div>

      <div className='node-heading'>
        <div className='node-glyph transform-glyph'>{nodeData.glyph}</div>
        <div className='node-heading-text'>
          <strong>{nodeData.label}</strong>
          <span>{nodeData.description}</span>
        </div>
      </div>

      <div className='node-footer'>Data processing</div>
    </div>
  );
}

function HttpRequestNode({ data }: NodeProps) {
  const nodeData = data as CanvasNodeData;

  return (
    <div className='flow-node http-node'>
      <Handle
        type='target'
        position={Position.Top}
        id='main'
        className='flow-handle'
      />

      <Handle
        type='source'
        position={Position.Bottom}
        id='main'
        className='flow-handle'
      />

      <div className='node-category'>{nodeData.category}</div>

      <div className='node-heading'>
        <div className='node-glyph http-glyph'>{nodeData.glyph}</div>
        <div className='node-heading-text'>
          <strong>{nodeData.label}</strong>
          <span>{nodeData.description}</span>
        </div>
      </div>

      <div className='node-footer'>External request</div>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  manualTrigger: ManualTriggerNode,
  transform: TransformNode,
  httpRequest: HttpRequestNode,
};

export default function App() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<CanvasNode>(initialNodes);

  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  // Count selected nodes and edges for the toolbar.
  const selectedCount =
    nodes.filter((node) => node.selected).length +
    edges.filter((edge) => edge.selected).length;

  // Create an edge when the user connects two handles.
  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((currentEdges) =>
        addEdge(
          {
            ...connection,
            type: "smoothstep",
          },
          currentEdges,
        ),
      );
    },
    [setEdges],
  );

  // Add a new node from the palette.
  const addNode = useCallback(
    (type: CanvasNodeKind) => {
      const id = `${type}-${crypto.randomUUID()}`;

      const newNode: CanvasNode = {
        id,
        type,
        position: {
          x: 300 + (nodes.length % 3) * 35,
          y: 100 + nodes.length * 100,
        },
        data: { ...nodeTemplates[type] },
      };

      setNodes((currentNodes) => [...currentNodes, newNode]);
    },
    [nodes.length, setNodes],
  );

  // Remove selected nodes and edges together.
  const deleteSelected = useCallback(() => {
    const selectedNodeIds = new Set(
      nodes.filter((node) => node.selected).map((node) => node.id),
    );

    const selectedEdgeIds = new Set(
      edges.filter((edge) => edge.selected).map((edge) => edge.id),
    );

    if (selectedNodeIds.size === 0 && selectedEdgeIds.size === 0) {
      return;
    }

    // Delete the selected nodes.
    setNodes((currentNodes) =>
      currentNodes.filter((node) => !selectedNodeIds.has(node.id)),
    );

    // Delete selected edges and edges attached to deleted nodes.
    setEdges((currentEdges) =>
      currentEdges.filter(
        (edge) =>
          !selectedEdgeIds.has(edge.id) &&
          !selectedNodeIds.has(edge.source) &&
          !selectedNodeIds.has(edge.target),
      ),
    );
  }, [nodes, edges, setNodes, setEdges]);

  return (
    <div className='flowai-app'>
      <header className='topbar'>
        <div className='brand'>
          <div className='brand-mark'>F</div>
          <div>
            <div className='brand-name'>FlowAI</div>
            <div className='brand-subtitle'>Workflow Studio</div>
          </div>
        </div>

        <div className='workflow-title'>
          <span className='breadcrumb'>Workflows</span>
          <span className='breadcrumb-divider'>/</span>
          <strong>Untitled workflow</strong>
          <span className='draft-badge'>DRAFT</span>
        </div>

        <div className='topbar-right'>
          <span className='prototype-indicator'>
            <span className='status-dot' />
            Editor prototype
          </span>
        </div>
      </header>

      <div className='workspace'>
        <aside className='sidebar'>
          <div className='sidebar-heading'>
            <div>
              <span className='section-eyebrow'>BUILD</span>
              <h2>Node palette</h2>
            </div>
          </div>

          <p className='sidebar-description'>
            Add a node to your canvas, then connect it to build a workflow.
          </p>

          <div className='palette-section'>
            <div className='palette-label'>TRIGGERS</div>

            <button
              className='palette-node'
              onClick={() => addNode("manualTrigger")}
            >
              <span className='palette-icon trigger-glyph'>▶</span>
              <span>
                <strong>Manual Trigger</strong>
                <small>Start a workflow</small>
              </span>
              <span className='add-symbol'>+</span>
            </button>
          </div>

          <div className='palette-section'>
            <div className='palette-label'>DATA</div>

            <button
              className='palette-node'
              onClick={() => addNode("transform")}
            >
              <span className='palette-icon transform-glyph'>ƒx</span>
              <span>
                <strong>Transform</strong>
                <small>Modify workflow data</small>
              </span>
              <span className='add-symbol'>+</span>
            </button>
          </div>

          <div className='palette-section'>
            <div className='palette-label'>ACTIONS</div>

            <button
              className='palette-node'
              onClick={() => addNode("httpRequest")}
            >
              <span className='palette-icon http-glyph'>↗</span>
              <span>
                <strong>HTTP Request</strong>
                <small>Call an API endpoint</small>
              </span>
              <span className='add-symbol'>+</span>
            </button>
          </div>

          <div className='sidebar-bottom'>
            <div className='sidebar-bottom-icon'>i</div>
            <p>
              This canvas is currently a local prototype. Saving and execution
              controls will be connected to the FlowAI API in the next steps.
            </p>
          </div>
        </aside>

        <main className='editor'>
          <div className='canvas-toolbar'>
            <div>
              <h1>Workflow canvas</h1>
              <p>Design how your automation runs</p>
            </div>

            <div className='canvas-toolbar-actions'>
              <button
                type='button'
                className='delete-selected-button'
                disabled={selectedCount === 0}
                onClick={deleteSelected}
              >
                Delete selected ({selectedCount})
              </button>

              <div className='canvas-count'>
                <span>{nodes.length} nodes</span>
                <span className='count-separator'>·</span>
                <span>{edges.length} connections</span>
              </div>
            </div>
          </div>

          <div className='canvas-area'>
            <ReactFlow<CanvasNode, Edge>
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              deleteKeyCode={["Backspace", "Delete"]}
              defaultEdgeOptions={{
                type: "smoothstep",
                style: {
                  stroke: "#667085",
                  strokeWidth: 2,
                },
              }}
              fitView
              minZoom={0.25}
              maxZoom={1.5}
            >
              <Background color='#30394a' gap={22} size={1} />
              <Controls />

              <MiniMap
                pannable
                zoomable
                nodeColor={(node) => {
                  if (node.type === "manualTrigger") return "#22c55e";
                  if (node.type === "transform") return "#8b5cf6";
                  if (node.type === "httpRequest") return "#3b82f6";
                  return "#64748b";
                }}
              />

              <div className='canvas-hint'>
                <span className='hint-key'>Tip</span>
                Drag nodes to arrange them. Select nodes or connections and
                press Delete to remove them.
              </div>
            </ReactFlow>
          </div>
        </main>
      </div>
    </div>
  );
}
