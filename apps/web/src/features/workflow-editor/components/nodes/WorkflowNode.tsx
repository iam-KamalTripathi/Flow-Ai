import { Handle, Position, type NodeProps } from "@xyflow/react";

import { getNodeDefinition, type NodeCategory } from "@FlowAi/node-definitions";

import "./WorkflowNode.css";

const categoryGlyph: Record<NodeCategory, string> = {
  trigger: "▶",
  data: "fx",
  action: "↗",
  logic: "⇄",
};

export function WorkflowNode({ id, type }: NodeProps) {
  const definition = type ? getNodeDefinition(type) : undefined;

  if (!definition) {
    return (
      <div className='flow-node unsupported-node'>
        <strong>Unsupported node</strong>
        <span>ID: {id}</span>
        <span>Type: {type ?? "missing"}</span>
      </div>
    );
  }

  return (
    <div className={`flow-node category-${definition.category}`}>
      {definition.inputs.map((port, index) => (
        <Handle
          key={port.id}
          id={port.id}
          type='target'
          position={Position.Top}
          isConnectable={(port.maxConnections ?? 1) > 0}
          className='flow-handle'
          style={{
            left: `${((index + 1) / (definition.inputs.length + 1)) * 100}%`,
          }}
        />
      ))}

      <div className='node-category'>{definition.category.toUpperCase()}</div>

      <div className='node-heading'>
        <div className={`node-glyph glyph-${definition.category}`}>
          {categoryGlyph[definition.category]}
        </div>

        <div className='node-heading-text'>
          <strong>{definition.name}</strong>
          <span>{definition.description}</span>
        </div>
      </div>

      <div className='node-footer'>
        {definition.inputs.length} inputs
        {" · "}
        {definition.outputs.length} outputs
      </div>

      {definition.outputs.map((port, index) => (
        <Handle
          key={port.id}
          id={port.id}
          type='source'
          position={Position.Bottom}
          isConnectable={(port.maxConnections ?? 1) > 0}
          className='flow-handle'
          style={{
            left: `${((index + 1) / (definition.outputs.length + 1)) * 100}%`,
          }}
        />
      ))}
    </div>
  );
}
