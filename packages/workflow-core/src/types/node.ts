import type { Position } from "./position.js";

export interface WorkflowNode<TConfig = unknown> {
  id: string;
  type: string;
  position: Position;
  config: TConfig;
}
